// MODAL

const modal = document.getElementById("modal");
const modalTitle = document.getElementById("modalTitle");
const modalText = document.getElementById("modalText");
const closeModal = document.getElementById("closeModal");
const copyPix = document.getElementById("copyPix");


// ABRIR MODAL

function openModal(title, text) {

  modalTitle.textContent = title;
  modalText.textContent = text;

  modal.classList.add("show");
}


// FECHAR MODAL

function hideModal() {
  modal.classList.remove("show");
}


// BOTÃO "QUERO AJUDAR"

const helpButton = document.getElementById("helpButton");

helpButton.addEventListener("click", function () {

  document.getElementById("organizacoes").scrollIntoView({
    behavior: "smooth"
  });

});


// BOTÃO "CONHEÇA NOSSO PROJETO"

const projectButton = document.getElementById("projectButton");

projectButton.addEventListener("click", function () {

  document.getElementById("causas").scrollIntoView({
    behavior: "smooth"
  });

});


// CATEGORIAS

const categories = document.querySelectorAll(".category-card");

categories.forEach(function (card) {

  card.addEventListener("click", function () {

    categories.forEach(function (item) {

      item.classList.remove("active");

      const check = item.querySelector(".check");

      if (check) {
        check.remove();
      }

    });

    card.classList.add("active");

    const check = document.createElement("span");

    check.className = "check";
    check.textContent = "✓";

    card.appendChild(check);

  });

});


// ORGANIZAÇÃO

const organizationButtons =
  document.querySelectorAll(".org-button");

organizationButtons.forEach(function (button) {

  button.addEventListener("click", function (event) {

    event.stopPropagation();

    const organization = button.dataset.org;

    openModal(
      organization,
      "Essa organização está localizada em São Paulo - SP. Aqui você poderá conhecer melhor o projeto e descobrir como ajudar."
    );

  });

});


// BOTÃO DE DOAÇÃO

const donationButton =
  document.getElementById("donationButton");

donationButton.addEventListener("click", function () {

  openModal(
    "Faça uma doação",
    "Sua contribuição ajuda a transformar vidas. Utilize a chave PIX da organização para realizar sua doação."
  );

});


// COPIAR PIX

copyPix.addEventListener("click", function () {

  const pix = "SUA-CHAVE-PIX-AQUI";

  navigator.clipboard.writeText(pix)
    .then(function () {

      copyPix.textContent = "PIX copiado!";

      setTimeout(function () {
        copyPix.textContent = "Copiar PIX";
      }, 2000);

    })
    .catch(function () {

      alert("Não foi possível copiar o PIX.");

    });

});


// FECHAR MODAL

closeModal.addEventListener("click", hideModal);


// CLICAR FORA DO MODAL

modal.addEventListener("click", function (event) {

  if (event.target === modal) {
    hideModal();
  }

});


// TECLA ESC

document.addEventListener("keydown", function (event) {

  if (event.key === "Escape") {
    hideModal();
  }

});


// BOTÃO VOLTAR AO TOPO

const topButton = document.getElementById("topButton");

topButton.addEventListener("click", function () {

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

});


// CORAÇÃO

const heartButton =
  document.getElementById("heartButton");

heartButton.addEventListener("click", function () {

  if (heartButton.textContent.trim() === "♥") {

    heartButton.textContent = "❤";

  } else {

    heartButton.textContent = "♥";

  }

});