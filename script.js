"use strict";

// ==========================================
// 1. CONFIGURAÇÃO DO SUPABASE
// ==========================================

const SUPABASE_URL =
  "https://pltxgwcakdktionnbcej.supabase.co";

const SUPABASE_KEY =
  "sb_publishable_HoAyiR8bpW8MLZlG1jwBCw_n1sHbIc9";

const ENDPOINT = `${SUPABASE_URL}/rest/v1/leads`;


// ==========================================
// 2. ELEMENTOS DO FORMULÁRIO
// ==========================================

const form = document.getElementById("leadForm");
const nomeInput = document.getElementById("nome");
const dddInput = document.getElementById("ddd");
const telefoneInput = document.getElementById("telefone");
const submitButton = document.getElementById("submitButton");
const message = document.getElementById("message");


// ==========================================
// 3. MÁSCARA E VALIDAÇÃO DO DDD
// ==========================================

dddInput.addEventListener("input", () => {
  dddInput.value = dddInput.value
    .replace(/\D/g, "")
    .slice(0, 2);
});


// ==========================================
// 4. MÁSCARA DO TELEFONE
// ==========================================

telefoneInput.addEventListener("input", () => {
  let digits = telefoneInput.value
    .replace(/\D/g, "")
    .slice(0, 9);

  if (digits.length > 5) {
    digits = digits.replace(
      /^(\d{5})(\d+)/,
      "$1-$2"
    );
  }

  telefoneInput.value = digits;
});


// ==========================================
// 5. MENSAGENS DE FEEDBACK
// ==========================================

function showMessage(text, type) {
  message.textContent = text;
  message.className = `message ${type}`;
}

function hideMessage() {
  message.textContent = "";
  message.className = "message";
}


// ==========================================
// 6. ENVIO DO FORMULÁRIO
// ==========================================

form.addEventListener("submit", async (event) => {
  event.preventDefault();
  hideMessage();

  const nome = nomeInput.value.trim();

  const ddd = dddInput.value
    .replace(/\D/g, "");

  const telefone = telefoneInput.value
    .replace(/\D/g, "");

  // Validar nome
  if (nome.length < 2 || nome.length > 120) {
    showMessage(
      "Informe um nome com pelo menos 2 caracteres.",
      "error"
    );

    nomeInput.focus();
    return;
  }

  // Validar DDD
  if (!/^\d{2}$/.test(ddd)) {
    showMessage(
      "Informe um DDD válido com 2 dígitos.",
      "error"
    );

    dddInput.focus();
    return;
  }

  // Validar telefone
  if (!/^\d{8,9}$/.test(telefone)) {
    showMessage(
      "Informe um telefone com 8 ou 9 dígitos.",
      "error"
    );

    telefoneInput.focus();
    return;
  }

  // ========================================
  // 7. PREPARAR OS DADOS PARA O SUPABASE
  // ========================================

  // DDD + telefone em uma única coluna.
  // Exemplo: 11 + 999999999 = 11999999999

  const lead = {
    nome: nome,
    telefone: ddd + telefone
  };

  submitButton.disabled = true;
  submitButton.textContent = "Enviando seus dados...";

  try {
    // ======================================
    // 8. REQUISIÇÃO À API REST
    // ======================================

    const response = await fetch(ENDPOINT, {
      method: "POST",

      headers: {
        "Content-Type": "application/json",
        "apikey": SUPABASE_KEY,
        "Authorization": `Bearer ${SUPABASE_KEY}`,
        "Prefer": "return=minimal"
      },

      body: JSON.stringify(lead)
    });

    if (!response.ok) {
      const details = await response.text();

      console.error(
        "Erro do Supabase:",
        response.status,
        details
      );

      if (
        response.status === 401 ||
        response.status === 403
      ) {
        throw new Error(
          "Acesso negado. Confira a chave e as permissões."
        );
      }

      if (response.status === 404) {
        throw new Error(
          "Tabela leads não encontrada. Confira o endpoint."
        );
      }

      if (
        response.status === 400 ||
        response.status === 409 ||
        response.status === 422
      ) {
        throw new Error(
          "O banco rejeitou os dados. Confira as colunas da tabela."
        );
      }

      throw new Error(
        "Não foi possível cadastrar. Tente novamente."
      );
    }

    // ======================================
    // 9. SUCESSO
    // ======================================

    showMessage(
      "Cadastro realizado com sucesso! Em breve entraremos em contato.",
      "success"
    );

    form.reset();

  } catch (error) {
    console.error("Erro ao cadastrar lead:", error);

    showMessage(
      error instanceof TypeError
        ? "Falha de conexão. Verifique a internet e o acesso à API."
        : error.message,
      "error"
    );

  } finally {
    submitButton.disabled = false;
    submitButton.textContent = "Quero receber contato →";
  }
});