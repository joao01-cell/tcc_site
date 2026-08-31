"use strict";

// Fluxo de autenticação local para o protótipo.
(() => {
  const introScreen = document.getElementById("introScreen");
  const beginRegistrationButton = document.getElementById("beginRegistration");
  const authShell = document.getElementById("authShell");
  const registerScreen = document.getElementById("registerScreen");
  const loginScreen = document.getElementById("loginScreen");
  const registerForm = document.getElementById("registerForm");
  const loginForm = document.getElementById("loginForm");
  const mainContent = document.getElementById("conteudo");
  const footer = document.querySelector("footer");
  const themeToggle = document.getElementById("themeToggle");
  const showLoginButton = document.getElementById("showLogin");
  const showRegisterButton = document.getElementById("showRegister");
  const USER_KEY = "facobem-demo-user";
  const SESSION_KEY = "facobem-demo-session";
  const THEME_KEY = "facobem-demo-theme";
  const securePasswordPattern = /^(?=.*[A-Z])(?=.*\d)(?=.*[!@#$]).{8,}$/;
  const emailPattern = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

  function readStorage(key) {
    try {
      return localStorage.getItem(key);
    } catch (error) {
      return null;
    }
  }

  function writeStorage(key, value) {
    try {
      localStorage.setItem(key, value);
    } catch (error) {
      // O fluxo continua funcional nesta demonstração mesmo sem armazenamento local.
    }
  }

  function removeStorage(key) {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      // Sem ação necessária para o protótipo.
    }
  }

  function getSavedUser() {
    const user = readStorage(USER_KEY);
    if (!user) return null;

    try {
      return JSON.parse(user);
    } catch (error) {
      removeStorage(USER_KEY);
      return null;
    }
  }

  function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const errorElement = document.getElementById(`${fieldId}Error`);
    const wrapper = field?.closest(".auth-field");

    wrapper?.classList.toggle("has-error", Boolean(message));
    field?.toggleAttribute("aria-invalid", Boolean(message));
    if (errorElement) errorElement.textContent = message;
  }

  function clearAuthErrors(form) {
    form.querySelectorAll(".auth-field").forEach((field) => field.classList.remove("has-error"));
    form.querySelectorAll(".auth-error").forEach((error) => {
      error.textContent = "";
    });
    const feedback = form.querySelector(".auth-feedback");
    if (feedback) feedback.textContent = "";
  }

  function showAuthFeedback(form, message) {
    const feedback = form.querySelector(".auth-feedback");
    if (feedback) feedback.textContent = message;
  }

  function showAuthScreen(screenName) {
    const showRegister = screenName === "register";
    registerScreen.hidden = !showRegister;
    loginScreen.hidden = showRegister;
    clearAuthErrors(showRegister ? registerForm : loginForm);

    const firstField = (showRegister ? registerForm : loginForm).querySelector("input");
    firstField?.focus();
  }

  function revealMainPage() {
    introScreen.hidden = true;
    authShell.hidden = true;
    mainContent.hidden = false;
    footer.hidden = false;
    writeStorage(SESSION_KEY, "authenticated");
    window.scrollTo({ top: 0, behavior: "auto" });
  }

  function validateRegistration() {
    const fullName = document.getElementById("registerFullName");
    const email = document.getElementById("registerEmail");
    const password = document.getElementById("registerPassword");
    const confirmation = document.getElementById("confirmPassword");
    let valid = true;

    clearAuthErrors(registerForm);

    if (!fullName.value.trim()) {
      setFieldError("registerFullName", "Informe seu nome completo.");
      valid = false;
    }

    if (!email.value.trim()) {
      setFieldError("registerEmail", "Informe seu e-mail.");
      valid = false;
    } else if (!emailPattern.test(email.value.trim())) {
      setFieldError("registerEmail", "Digite um e-mail válido.");
      valid = false;
    }

    if (!password.value) {
      setFieldError("registerPassword", "Crie uma senha segura.");
      valid = false;
    } else if (!securePasswordPattern.test(password.value)) {
      setFieldError("registerPassword", "Use 8+ caracteres, maiúscula, número e símbolo (!@#$).");
      valid = false;
    }

    if (!confirmation.value) {
      setFieldError("confirmPassword", "Repita sua senha.");
      valid = false;
    } else if (confirmation.value !== password.value) {
      setFieldError("confirmPassword", "As senhas precisam ser iguais.");
      valid = false;
    }

    return valid;
  }

  function validateLogin() {
    const fullName = document.getElementById("loginFullName");
    const email = document.getElementById("loginEmail");
    const password = document.getElementById("loginPassword");
    let valid = true;

    clearAuthErrors(loginForm);

    if (!fullName.value.trim()) {
      setFieldError("loginFullName", "Informe seu nome completo.");
      valid = false;
    }

    if (!email.value.trim()) {
      setFieldError("loginEmail", "Informe seu e-mail.");
      valid = false;
    } else if (!emailPattern.test(email.value.trim())) {
      setFieldError("loginEmail", "Digite um e-mail válido.");
      valid = false;
    }

    if (!password.value) {
      setFieldError("loginPassword", "Informe sua senha.");
      valid = false;
    } else if (!securePasswordPattern.test(password.value)) {
      setFieldError("loginPassword", "A senha precisa ter maiúscula, número e símbolo (!@#$).");
      valid = false;
    }

    return valid;
  }

  function applyTheme(theme) {
    const isDark = theme === "dark";
    document.body.classList.toggle("dark-mode", isDark);
    themeToggle?.setAttribute("aria-pressed", String(isDark));
    themeToggle?.setAttribute("aria-label", isDark ? "Ativar modo claro" : "Ativar modo escuro");
  }

  registerForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateRegistration()) {
      showAuthFeedback(registerForm, "Revise os campos destacados antes de continuar.");
      return;
    }

    const email = document.getElementById("registerEmail").value.trim().toLowerCase();
    const existingUser = getSavedUser();
    if (existingUser?.email === email) {
      showAuthFeedback(registerForm, "Este e-mail já está cadastrado. Faça login para continuar.");
      return;
    }

    const user = {
      fullName: document.getElementById("registerFullName").value.trim(),
      email,
      password: document.getElementById("registerPassword").value,
    };

    writeStorage(USER_KEY, JSON.stringify(user));
    revealMainPage();
  });

  loginForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateLogin()) {
      showAuthFeedback(loginForm, "Revise os campos destacados antes de entrar.");
      return;
    }

    const savedUser = getSavedUser();
    const enteredName = document.getElementById("loginFullName").value.trim();
    const enteredEmail = document.getElementById("loginEmail").value.trim().toLowerCase();
    const enteredPassword = document.getElementById("loginPassword").value;

    if (!savedUser) {
      showAuthFeedback(loginForm, "Nenhuma conta encontrada. Cadastre-se primeiro.");
      return;
    }

    if (savedUser.fullName !== enteredName || savedUser.email !== enteredEmail || savedUser.password !== enteredPassword) {
      showAuthFeedback(loginForm, "Nome, e-mail ou senha não conferem.");
      return;
    }

    revealMainPage();
  });

  showLoginButton?.addEventListener("click", () => showAuthScreen("login"));
  showRegisterButton?.addEventListener("click", () => showAuthScreen("register"));

  beginRegistrationButton?.addEventListener("click", () => {
    introScreen.hidden = true;
    authShell.hidden = false;
    showAuthScreen("register");
  });

  const savedTheme = readStorage(THEME_KEY) || "light";
  applyTheme(savedTheme);
  themeToggle?.addEventListener("click", () => {
    const nextTheme = document.body.classList.contains("dark-mode") ? "light" : "dark";
    applyTheme(nextTheme);
    writeStorage(THEME_KEY, nextTheme);
  });

  // A apresentação da ONG é sempre a primeira etapa do fluxo.
  // O usuário só acessa o cadastro depois de clicar em “Cadastre-se”.
  removeStorage(SESSION_KEY);
  introScreen.hidden = false;
  authShell.hidden = true;
  mainContent.hidden = true;
  footer.hidden = true;
})();

(() => {
  const modal = document.getElementById("modal");
  const successModal = document.getElementById("successModal");
  const foodSuccessModal = document.getElementById("foodSuccessModal");
  const foodFormModal = document.getElementById("foodFormModal");
  const pixDonationModal = document.getElementById("pixDonationModal");
  const pixThankYouModal = document.getElementById("pixThankYouModal");
  const gameSuccessModal = document.getElementById("gameSuccessModal");
  const modalTitle = document.getElementById("modalTitle");
  const modalText = document.getElementById("modalText");
  const closeModalButton = document.getElementById("closeModal");
  const closeFoodFormButton = document.getElementById("closeFoodForm");
  const copyPixButton = document.getElementById("copyPix");
  const modalPixKeyInput = document.getElementById("modalPixKey");
  const finishDonationButton = document.getElementById("finishDonation");
  const successButton = document.getElementById("successButton");
  const returnHomeButton = document.getElementById("returnHomeButton");
  const gameSuccessButton = document.getElementById("gameSuccessButton");
  const closePixDonationButton = document.getElementById("closePixDonation");
  const pixBackButton = document.getElementById("pixBackButton");
  const pixConfirmButton = document.getElementById("pixConfirmButton");
  const pixThankYouButton = document.getElementById("pixThankYouButton");
  const pixPaymentMethod = document.getElementById("pixPaymentMethod");
  const pixPaymentError = document.getElementById("pixPaymentError");
  const categories = [...document.querySelectorAll(".category-card")];
  const overlays = [modal, foodFormModal, successModal, foodSuccessModal, gameSuccessModal, pixDonationModal, pixThankYouModal].filter(Boolean);
  let lastFocusedElement = null;
  let foodDonationCompleted = false;

  function anyModalOpen() {
    return overlays.some((overlay) => !overlay.hidden);
  }

  function setModalVisibility(overlay, isVisible) {
    if (!overlay) return;

    overlay.hidden = !isVisible;
    document.body.classList.toggle("modal-open", anyModalOpen());
  }

  function openModal(title, text) {
    if (!modal) return;

    modalTitle.textContent = title;
    modalText.textContent = text;
    lastFocusedElement = document.activeElement;
    setModalVisibility(modal, true);
    closeModalButton?.focus();
  }

  function closeModal(overlay = modal, restoreFocus = true) {
    if (!overlay) return;

    const wasVisible = !overlay.hidden;
    setModalVisibility(overlay, false);

    if (
      wasVisible &&
      restoreFocus &&
      lastFocusedElement &&
      typeof lastFocusedElement.focus === "function"
    ) {
      lastFocusedElement.focus();
    }
  }

  function openFoodForm() {
    lastFocusedElement = document.getElementById("openFoodDonationButton");
    setModalVisibility(foodFormModal, true);
    document.getElementById("product")?.focus();
  }

  function openPixDonation() {
    lastFocusedElement = document.activeElement;
    if (pixPaymentMethod) pixPaymentMethod.value = "";
    if (pixPaymentError) pixPaymentError.textContent = "";
    setModalVisibility(pixDonationModal, true);
    pixPaymentMethod?.focus();
  }

  function updateCategorySelection(selectedCard) {
    categories.forEach((card) => {
      const isSelected = card === selectedCard;
      card.classList.toggle("active", isSelected);
      card.setAttribute("aria-pressed", String(isSelected));

      const currentCheck = card.querySelector(".check");

      if (isSelected && !currentCheck) {
        const check = document.createElement("span");
        check.className = "check";
        check.setAttribute("aria-hidden", "true");
        check.textContent = "✓";
        card.appendChild(check);
      }

      if (!isSelected && currentCheck) {
        currentCheck.remove();
      }
    });

    const selectionStatus = document.getElementById("selectionStatus");
    if (selectionStatus) {
      selectionStatus.textContent = `Causa selecionada: ${selectedCard.dataset.cause}`;
    }
  }

  function formatPhone(value) {
    const digits = value.replace(/\D/g, "").slice(0, 11);

    if (digits.length <= 2) return digits;
    if (digits.length <= 7) return `(${digits.slice(0, 2)}) ${digits.slice(2)}`;
    return `(${digits.slice(0, 2)}) ${digits.slice(2, 7)}-${digits.slice(7)}`;
  }

  function getTodayAsInputValue() {
    const today = new Date();
    const year = today.getFullYear();
    const month = String(today.getMonth() + 1).padStart(2, "0");
    const day = String(today.getDate()).padStart(2, "0");
    return `${year}-${month}-${day}`;
  }

  function formatDateForMessage(dateValue) {
    const [year, month, day] = dateValue.split("-");
    return `${day}/${month}/${year}`;
  }

  function setFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(`${fieldId}Error`);

    field?.closest(".form-field")?.classList.toggle("has-error", Boolean(message));

    if (error) {
      error.textContent = message;
    }

    if (message) {
      field?.setAttribute("aria-invalid", "true");
    } else {
      field?.removeAttribute("aria-invalid");
    }
  }

  function clearFoodFormErrors() {
    [
      "product",
      "quantity",
      "donationDate",
      "price",
      "paymentMethod",
      "pixKey",
      "donorName",
      "phone",
    ].forEach((fieldId) => setFieldError(fieldId, ""));

    const feedback = document.getElementById("formFeedback");
    if (feedback) feedback.textContent = "";
  }

  function updatePixRequirement() {
    const paymentMethod = document.getElementById("paymentMethod");
    const pixKey = document.getElementById("pixKey");
    const pixRequiredLabel = document.getElementById("pixRequiredLabel");

    const requiresPix = paymentMethod?.value === "PIX";
    pixKey?.toggleAttribute("required", requiresPix);

    if (pixRequiredLabel) {
      pixRequiredLabel.textContent = requiresPix
        ? "(obrigatória para PIX)"
        : "(opcional para outros métodos)";
    }
  }

  function validateFoodForm() {
    const product = document.getElementById("product");
    const quantity = document.getElementById("quantity");
    const donationDate = document.getElementById("donationDate");
    const price = document.getElementById("price");
    const paymentMethod = document.getElementById("paymentMethod");
    const pixKey = document.getElementById("pixKey");
    const donorName = document.getElementById("donorName");
    const phone = document.getElementById("phone");
    const feedback = document.getElementById("formFeedback");
    let firstInvalidField = null;
    let hasError = false;

    clearFoodFormErrors();

    function invalid(field, message) {
      setFieldError(field.id, message);
      firstInvalidField ||= field;
      hasError = true;
    }

    if (!product.value.trim()) {
      invalid(product, "Informe o alimento que será doado.");
    }

    if (!quantity.value || Number(quantity.value) < 1) {
      invalid(quantity, "Informe uma quantidade maior que zero.");
    }

    if (!donationDate.value) {
      invalid(donationDate, "Escolha uma data para a doação.");
    } else if (donationDate.value < donationDate.min) {
      invalid(donationDate, "Escolha hoje ou uma data futura.");
    }

    if (!price.value || Number(price.value) <= 0) {
      invalid(price, "Informe um valor maior que zero.");
    }

    if (!paymentMethod.value) {
      invalid(paymentMethod, "Selecione o método de pagamento.");
    }

    if (paymentMethod.value === "PIX" && !pixKey.value.trim()) {
      invalid(pixKey, "Informe a chave PIX para este método.");
    }

    if (!donorName.value.trim()) {
      invalid(donorName, "Informe seu nome.");
    }

    const phoneDigits = phone.value.replace(/\D/g, "");
    if (phoneDigits.length < 10) {
      invalid(phone, "Informe um telefone válido com DDD.");
    }

    if (hasError) {
      feedback.textContent = "Revise os campos destacados antes de enviar.";
      firstInvalidField?.focus();
    }

    return !hasError;
  }

  function openFoodSuccessModal(dateValue) {
    const successText = document.getElementById("foodSuccessText");
    const formattedDate = formatDateForMessage(dateValue);

    if (successText) {
      successText.textContent = `Sua contribuição foi registrada para ${formattedDate}. Juntos, podemos transformar vidas.`;
    }

    lastFocusedElement = document.getElementById("openFoodDonationButton");
    setModalVisibility(foodFormModal, false);
    setModalVisibility(foodSuccessModal, true);
    returnHomeButton?.focus();
  }

  // Navegação da página existente.
  document.getElementById("helpButton")?.addEventListener("click", () => {
    document.getElementById("organizacoes")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  document.getElementById("projectButton")?.addEventListener("click", () => {
    document.getElementById("causas")?.scrollIntoView({ behavior: "smooth", block: "start" });
  });

  categories.forEach((card) => {
    card.addEventListener("click", () => {
      updateCategorySelection(card);
      if (card.dataset.cause === "PIX") openPixDonation();
    });
  });

  document.querySelectorAll(".org-button").forEach((button) => {
    button.addEventListener("click", (event) => {
      event.stopPropagation();
      const organization = button.dataset.org || "Organização";
      openModal(
        organization,
        "Essa organização está localizada em São Paulo - SP. Conheça o projeto e veja como sua contribuição pode ajudar."
      );
    });
  });

  document.querySelectorAll(".org-card").forEach((card) => {
    card.addEventListener("click", () => {
      document.querySelectorAll(".org-card").forEach((item) => item.classList.remove("selected"));
      card.classList.add("selected");
    });

    card.addEventListener("keydown", (event) => {
      if ((event.key === "Enter" || event.key === " ") && event.target === card) {
        event.preventDefault();
        card.click();
      }
    });
  });

  document.getElementById("donationButton")?.addEventListener("click", openPixDonation);

  document.getElementById("foodHelpButton")?.addEventListener("click", () => {
    openModal(
      "Precisa de ajuda?",
      "Preencha o formulário com o alimento, a quantidade, a data e seus dados de contato. Se ainda tiver dúvidas, procure a equipe da ONG."
    );
  });

  document.getElementById("openFoodDonationButton")?.addEventListener("click", openFoodForm);
  closeFoodFormButton?.addEventListener("click", () => closeModal(foodFormModal));

  copyPixButton?.addEventListener("click", async () => {
    const pix = modalPixKeyInput.value;
    let copied = false;

    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(pix);
        copied = true;
      } else {
        modalPixKeyInput.select();
        copied = document.execCommand("copy");
        modalPixKeyInput.setSelectionRange(0, 0);
      }
    } catch (error) {
      copied = false;
    }

    copyPixButton.textContent = copied ? "PIX copiado!" : "Selecione e copie";
    copyPixButton.setAttribute(
      "aria-label",
      copied ? "Chave PIX copiada" : "Selecione a chave PIX para copiar manualmente"
    );

    window.setTimeout(() => {
      copyPixButton.textContent = "Copiar PIX";
      copyPixButton.setAttribute("aria-label", "Copiar chave PIX");
    }, 2200);
  });

  closeModalButton?.addEventListener("click", () => closeModal(modal));
  successButton?.addEventListener("click", () => closeModal(successModal));
  closePixDonationButton?.addEventListener("click", () => closeModal(pixDonationModal));
  pixBackButton?.addEventListener("click", () => closeModal(pixDonationModal));

  pixConfirmButton?.addEventListener("click", () => {
    if (!pixPaymentMethod?.value) {
      if (pixPaymentError) pixPaymentError.textContent = "Selecione uma forma de pagamento antes de confirmar.";
      pixPaymentMethod?.focus();
      return;
    }

    if (pixPaymentError) pixPaymentError.textContent = "";
    closeModal(pixDonationModal, false);
    setModalVisibility(pixThankYouModal, true);
    pixThankYouButton?.focus();
  });

  pixThankYouButton?.addEventListener("click", () => {
    closeModal(pixThankYouModal, false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.getElementById("inicio")?.focus({ preventScroll: true });
  });

  finishDonationButton?.addEventListener("click", () => {
    closeModal(modal, false);
    setModalVisibility(successModal, true);
    successButton?.focus();
  });

  overlays.forEach((overlay) => {
    overlay.addEventListener("click", (event) => {
      if (event.target === overlay) closeModal(overlay);
    });
  });

  document.addEventListener("keydown", (event) => {
    if (event.key !== "Escape") return;

    const openOverlay = [...overlays].reverse().find((overlay) => !overlay.hidden);
    if (openOverlay) closeModal(openOverlay);
  });

  document.getElementById("topButton")?.addEventListener("click", () => {
    window.scrollTo({ top: 0, behavior: "smooth" });
  });

  document.getElementById("heartButton")?.addEventListener("click", (event) => {
    const button = event.currentTarget;
    const isLiked = button.classList.toggle("liked");
    button.textContent = isLiked ? "♥" : "♡";
    button.setAttribute("aria-pressed", String(isLiked));
    button.setAttribute(
      "aria-label",
      isLiked ? "Remover esta causa dos favoritos" : "Marcar esta causa como favorita"
    );
  });

  // Formulário de alimentos não perecíveis.
  const foodDonationForm = document.getElementById("foodDonationForm");
  const donationDate = document.getElementById("donationDate");
  const paymentMethod = document.getElementById("paymentMethod");
  const phone = document.getElementById("phone");

  if (donationDate) {
    donationDate.min = getTodayAsInputValue();
  }

  paymentMethod?.addEventListener("change", updatePixRequirement);
  updatePixRequirement();

  phone?.addEventListener("input", () => {
    phone.value = formatPhone(phone.value);
  });

  foodDonationForm?.addEventListener("submit", (event) => {
    event.preventDefault();

    if (!validateFoodForm()) return;

    foodDonationCompleted = true;
    openFoodSuccessModal(donationDate.value);
  });

  returnHomeButton?.addEventListener("click", () => {
    if (foodDonationCompleted) {
      foodDonationForm?.reset();
      clearFoodFormErrors();
      updatePixRequirement();
      foodDonationCompleted = false;
    }

    closeModal(foodSuccessModal, false);
    window.scrollTo({ top: 0, behavior: "smooth" });
    document.getElementById("inicio")?.focus({ preventScroll: true });
  });

  // Doação de jogos interativos.
  const gameCards = [...document.querySelectorAll(".game-card")];
  const gameDonationForm = document.getElementById("gameDonationForm");
  const selectedGameInput = document.getElementById("selectedGame");
  const gameDate = document.getElementById("gameDate");
  const gamePaymentMethod = document.getElementById("gamePaymentMethod");
  const gamePixKey = document.getElementById("gamePixKey");
  const gamePhone = document.getElementById("gamePhone");
  const gameFeedback = document.getElementById("gameFeedback");

  function setGameFieldError(fieldId, message) {
    const field = document.getElementById(fieldId);
    const error = document.getElementById(`${fieldId}Error`);
    field?.closest(".game-field")?.classList.toggle("has-error", Boolean(message));
    field?.toggleAttribute("aria-invalid", Boolean(message));
    if (error) error.textContent = message;
  }

  function clearGameErrors() {
    [
      "gameDonorName",
      "gameQuantity",
      "gameDate",
      "selectedGame",
      "gamePaymentMethod",
      "gamePixKey",
      "gamePhone",
    ].forEach((fieldId) => setGameFieldError(fieldId, ""));
    if (gameFeedback) gameFeedback.textContent = "";
  }

  function selectGame(card) {
    gameCards.forEach((gameCard) => {
      const isSelected = gameCard === card;
      gameCard.classList.toggle("active", isSelected);
      gameCard.setAttribute("aria-pressed", String(isSelected));
    });

    if (selectedGameInput) selectedGameInput.value = card.dataset.game || "";
    const status = document.getElementById("gameSelectionStatus");
    if (status) status.textContent = `Jogo selecionado: ${card.dataset.game}`;
    setGameFieldError("selectedGame", "");
  }

  function validateGameDonation() {
    const donorName = document.getElementById("gameDonorName");
    const quantity = document.getElementById("gameQuantity");
    let valid = true;
    let firstInvalid = null;

    clearGameErrors();

    function invalid(field, message) {
      setGameFieldError(field.id, message);
      firstInvalid ||= field;
      valid = false;
    }

    if (!donorName.value.trim()) invalid(donorName, "Informe seu nome.");
    if (!quantity.value || Number(quantity.value) < 1) invalid(quantity, "Informe uma quantidade maior que zero.");
    if (!gameDate.value) invalid(gameDate, "Escolha a data da doação.");
    else if (gameDate.value < gameDate.min) invalid(gameDate, "Escolha hoje ou uma data futura.");
    if (!selectedGameInput.value) invalid(selectedGameInput, "Escolha um jogo na lista.");
    if (!gamePaymentMethod.value) invalid(gamePaymentMethod, "Selecione a forma de pagamento.");
    if (gamePaymentMethod.value === "PIX" && !gamePixKey.value.trim()) invalid(gamePixKey, "Informe a chave PIX para este método.");

    const phoneDigits = gamePhone.value.replace(/\\D/g, "");
    if (phoneDigits.length < 10) invalid(gamePhone, "Informe um telefone válido com DDD.");

    if (!valid) {
      gameFeedback.textContent = "Revise os campos destacados antes de enviar.";
      firstInvalid?.focus();
    }

    return valid;
  }

  gameCards.forEach((card) => {
    card.addEventListener("click", () => selectGame(card));
  });

  if (gameDate) gameDate.min = getTodayAsInputValue();

  gamePhone?.addEventListener("input", () => {
    gamePhone.value = formatPhone(gamePhone.value);
  });

  gamePaymentMethod?.addEventListener("change", () => {
    const label = document.getElementById("gamePixLabel");
    const requiresPix = gamePaymentMethod.value === "PIX";
    gamePixKey?.toggleAttribute("required", requiresPix);
    if (label) label.textContent = requiresPix ? "(obrigatória para PIX)" : "(opcional)";
  });

  gameDonationForm?.addEventListener("submit", (event) => {
    event.preventDefault();
    if (!validateGameDonation()) return;

    const successText = document.getElementById("gameSuccessText");
    if (successText) {
      successText.textContent = `Sua doação de ${selectedGameInput.value} foi registrada. Sua contribuição ajuda a fazer a diferença.`;
    }

    setModalVisibility(gameSuccessModal, true);
    gameSuccessButton?.focus();
  });

  gameSuccessButton?.addEventListener("click", () => {
    gameDonationForm?.reset();
    clearGameErrors();
    gameCards.forEach((card) => {
      card.classList.remove("active");
      card.setAttribute("aria-pressed", "false");
    });
    if (selectedGameInput) selectedGameInput.value = "";
    const status = document.getElementById("gameSelectionStatus");
    if (status) status.textContent = "Nenhum jogo selecionado.";
    closeModal(gameSuccessModal, false);
    document.getElementById("inicio")?.focus({ preventScroll: true });
  });
})();
