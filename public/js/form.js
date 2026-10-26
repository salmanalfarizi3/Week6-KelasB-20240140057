const captionForm = document.getElementById("caption-form");
const productNameInput = document.getElementById("product-name");
const platformSelect = document.getElementById("platform");
const toneSelect = document.getElementById("tone");
const keyBenefitInput = document.getElementById("key-benefit");
const promoOfferInput = document.getElementById("promo-offer");
const ctaTextInput = document.getElementById("cta-text");
const hashtagsInput = document.getElementById("hashtags-input");
const useEmojiCheckbox = document.getElementById("use-emoji");
const useHashtagsCheckbox = document.getElementById("use-hashtags");

const nameError = document.getElementById("name-error");
const platformError = document.getElementById("platform-error");
const benefitError = document.getElementById("benefit-error");
const hashtagError = document.getElementById("hashtag-error");
const nameCounter = document.getElementById("name-counter");
const benefitCounter = document.getElementById("benefit-counter");
const formFeedback = document.getElementById("form-feedback");

const emptyOutput = document.getElementById("empty-output");
const resultContainer = document.getElementById("result-container");
const captionOutput = document.getElementById("caption-output");
const badgeMeta = document.getElementById("badge-meta");
const statChars = document.getElementById("stat-chars");
const statWords = document.getElementById("stat-words");
const statTags = document.getElementById("stat-tags");

const copyBtn = document.getElementById("copy-btn");
const regenerateBtn = document.getElementById("regenerate-btn");
const copyFeedback = document.getElementById("copy-feedback");
const historyList = document.getElementById("history-list");
const clearHistoryBtn = document.getElementById("clear-history-btn");

let currentTemplateIndex = 0;
let captionHistory = [];


function setFieldError(inputEl, errorEl, message) {
  if (message) {
    inputEl.classList.add("input-invalid");
    errorEl.textContent = message;
  } else {
    inputEl.classList.remove("input-invalid");
    errorEl.textContent = "";
  }
}


function showBanner(message, type = "error") {
  formFeedback.textContent = message;
  formFeedback.className = `feedback-banner ${type}`;
}

function hideBanner() {
  formFeedback.className = "feedback-banner hidden";
  formFeedback.textContent = "";
}


function validateForm() {
  let isValid = true;
  const productName = productNameInput.value.trim();
  const platform = platformSelect.value.trim();
  const benefit = keyBenefitInput.value.trim();
  const rawHashtags = hashtagsInput.value.trim();

  if (productName.length < 3) {
    setFieldError(productNameInput, nameError, "Nama produk/topik minimal 3 karakter.");
    isValid = false;
  } else {
    setFieldError(productNameInput, nameError, "");
  }

  if (!platform) {
    setFieldError(platformSelect, platformError, "Pilih salah satu platform target.");
    isValid = false;
  } else {
    setFieldError(platformSelect, platformError, "");
  }

  if (benefit.length < 10) {
    setFieldError(
      keyBenefitInput,
      benefitError,
      "Keunggulan/deskripsi singkat minimal 10 karakter."
    );
    isValid = false;
  } else {
    setFieldError(keyBenefitInput, benefitError, "");
  }

  if (rawHashtags.length > 0) {
    const tags = rawHashtags.split(",").map((t) => t.trim()).filter(Boolean);
    const invalidTag = tags.find((t) => !/^[a-zA-Z0-9_\s]+$/.test(t.replace(/^#/, "")));
    if (invalidTag) {
      setFieldError(
        hashtagsInput,
        hashtagError,
        "Hashtag hanya boleh berisi huruf, angka, atau garis bawah."
      );
      isValid = false;
    } else {
      setFieldError(hashtagsInput, hashtagError, "");
    }
  } else {
    setFieldError(hashtagsInput, hashtagError, "");
  }

  if (!isValid) {
    showBanner("Mohon periksa kembali input yang bertanda merah.", "error");
  } else {
    hideBanner();
  }

  return isValid;
}

/**
 * Buat daftar hashtag rapi dari input pengguna dan nama produk
 */
function buildHashtags(productName, platform, rawHashtags, includeTags) {
  if (!includeTags) return [];

  const manualTags = rawHashtags
    .split(",")
    .map((item) => item.trim().replace(/^#+/, "").replace(/\s+/g, ""))
    .filter(Boolean);

  const autoSlug = productName
    .toLowerCase()
    .replace(/[^a-z0-9\s]/g, "")
    .split(/\s+/)
    .slice(0, 2)
    .join("");

  const platformTag = platform.toLowerCase().replace(/[^a-z0-9]/g, "");
  const combined = [...new Set([...manualTags, autoSlug, platformTag, "rekomendasi"])].filter(
    Boolean
  );

  return combined.map((tag) => `#${tag}`);
}

/**
 * Susun variasi teks caption berdasarkan tone dan input pengguna
 */
function composeCaption(data, variationIndex = 0) {
  const {
    productName,
    platform,
    tone,
    keyBenefit,
    promoOffer,
    ctaText,
    useEmoji,
    hashtags,
  } = data;

  const emoji = useEmoji
    ? {
        sparkle: "✨ ",
        fire: "🔥 ",
        point: "👉 ",
        check: "✅ ",
        rocket: "🚀 ",
      }
    : { sparkle: "", fire: "", point: "", check: "", rocket: "" };

  const promoLine = promoOffer ? `
${emoji.fire}Promo Spesial: ${promoOffer}!` : "";
  const ctaLine = ctaText
    ? `
${emoji.point}${ctaText}`
    : `
${emoji.point}Yuk, dapatkan ${productName} sekarang juga!`;
  const hashtagBlock = hashtags.length > 0 ? `

${hashtags.join(" ")}` : "";

  const templates = {
    santai: [
      `${emoji.sparkle}Lagi cari ${productName} yang beneran worth it?

Kenalin nih, ${productName}! ${keyBenefit}${promoLine}${ctaLine}${hashtagBlock}`,
      `Jangan sampai ketinggalan info tentang ${productName}! ${emoji.rocket}

${keyBenefit}${promoLine}${ctaLine}${hashtagBlock}`,
    ],
    profesional: [
      `Solusi Terbaik melalui ${productName}.

${ emoji.check }${keyBenefit}${promoLine}

Dirancang untuk memberikan kualitas optimal bagi kebutuhan Anda.${ctaLine}${hashtagBlock}`,
      `Tingkatkan standar Anda bersama ${productName}.

${keyBenefit}${promoLine}${ctaLine}${hashtagBlock}`,
    ],
    promosi: [
      `${emoji.fire}PENAWARAN TERBATAS: ${productName.toUpperCase()}!${promoLine}

Kenapa wajib punya sekarang?
${emoji.check}${keyBenefit}${ctaLine}${hashtagBlock}`,
      `${emoji.sparkle}Jangan tunggu kehabisan! ${productName} hadir dengan kualitas unggulan.

${keyBenefit}${promoLine}${ctaLine}${hashtagBlock}`,
    ],
    storytelling: [
      `Pernah merasa sulit menemukan produk yang pas? Dari situlah ${productName} hadir.${emoji.sparkle}

${keyBenefit}${promoLine}${ctaLine}${hashtagBlock}`,
      `Setiap detail pada ${productName} dibuat dengan penuh perhatian.

${keyBenefit}${promoLine}${ctaLine}${hashtagBlock}`,
    ],
  };

  const selectedList = templates[tone] || templates.santai;
  const chosenTemplate = selectedList[variationIndex % selectedList.length];

  return {
    caption: chosenTemplate,
    platform,
    tone,
    hashtagsCount: hashtags.length,
  };
}

/**
 * Tampilkan hasil caption dan statistik ke DOM
 */
function renderCaptionResult(result) {
  emptyOutput.classList.add("hidden");
  resultContainer.classList.remove("hidden");
  copyFeedback.classList.add("hidden");

  captionOutput.textContent = result.caption;
  badgeMeta.textContent = `${result.platform} • ${
    result.tone.charAt(0).toUpperCase() + result.tone.slice(1)
  }`;

  const text = result.caption.trim();
  const wordCount = text ? text.split(/\s+/).length : 0;

  statChars.textContent = String(text.length);
  statWords.textContent = String(wordCount);
  statTags.textContent = String(result.hashtagsCount);
}

/**
 * Simpan & tampilkan riwayat caption
 */
function addToHistory(productName, platform, captionText) {
  captionHistory.unshift({
    productName,
    platform,
    captionText,
    time: new Date().toLocaleTimeString("id-ID", {
      hour: "2-digit",
      minute: "2-digit",
    }),
  });

  if (captionHistory.length > 5) {
    captionHistory.pop();
  }

  renderHistory();
}

function renderHistory() {
  historyList.innerHTML = "";

  if (captionHistory.length === 0) {
    clearHistoryBtn.classList.add("hidden");
    const emptyItem = document.createElement("li");
    emptyItem.className = "history-empty";
    emptyItem.textContent = "Belum ada riwayat caption.";
    historyList.appendChild(emptyItem);
    return;
  }

  clearHistoryBtn.classList.remove("hidden");

  captionHistory.forEach((item) => {
    const li = document.createElement("li");
    li.className = "history-item";

    const meta = document.createElement("div");
    meta.className = "history-item-meta";
    meta.textContent = `${item.platform} • ${item.time}`;

    const preview = document.createElement("div");
    preview.textContent = `${item.productName} — "${item.captionText.slice(0, 65)}..."`;

    li.appendChild(meta);
    li.appendChild(preview);

    li.addEventListener("click", () => {
      captionOutput.textContent = item.captionText;
      badgeMeta.textContent = `${item.platform} • Riwayat`;
      statChars.textContent = String(item.captionText.length);
      statWords.textContent = String(item.captionText.trim().split(/\s+/).length);
      emptyOutput.classList.add("hidden");
      resultContainer.classList.remove("hidden");
    });

    historyList.appendChild(li);
  });
}

/**
 * Ambil data dari elemen form
 */
function getFormData() {
  const productName = productNameInput.value.trim();
  const platform = platformSelect.value.trim();
  const tone = toneSelect.value;
  const keyBenefit = keyBenefitInput.value.trim();
  const promoOffer = promoOfferInput.value.trim();
  const ctaText = ctaTextInput.value.trim();
  const rawHashtags = hashtagsInput.value.trim();
  const useEmoji = useEmojiCheckbox.checked;
  const useHashtags = useHashtagsCheckbox.checked;

  const hashtags = buildHashtags(productName, platform, rawHashtags, useHashtags);

  return {
    productName,
    platform,
    tone,
    keyBenefit,
    promoOffer,
    ctaText,
    useEmoji,
    hashtags,
  };
}

// Event Listener: Input Character Counter & Live Validation
productNameInput.addEventListener("input", () => {
  nameCounter.textContent = `${productNameInput.value.length} / 80`;
  if (productNameInput.value.trim().length >= 3) {
    setFieldError(productNameInput, nameError, "");
  }
});

keyBenefitInput.addEventListener("input", () => {
  benefitCounter.textContent = `${keyBenefitInput.value.length} / 250`;
  if (keyBenefitInput.value.trim().length >= 10) {
    setFieldError(keyBenefitInput, benefitError, "");
  }
});

platformSelect.addEventListener("change", () => {
  if (platformSelect.value) {
    setFieldError(platformSelect, platformError, "");
  }
});

// Event Listener: Submit Form
captionForm.addEventListener("submit", (event) => {
  event.preventDefault();

  if (!validateForm()) {
    return;
  }

  currentTemplateIndex = 0;
  const data = getFormData();
  const result = composeCaption(data, currentTemplateIndex);

  renderCaptionResult(result);
  addToHistory(data.productName, data.platform, result.caption);
  showBanner("Caption berhasil dibuat!", "success");
});

// Event Listener: Variasi Caption Lain
regenerateBtn.addEventListener("click", () => {
  if (!validateForm()) return;
  currentTemplateIndex += 1;
  const data = getFormData();
  const result = composeCaption(data, currentTemplateIndex);
  renderCaptionResult(result);
});

// Event Listener: Salin Caption ke Clipboard
copyBtn.addEventListener("click", async () => {
  const textToCopy = captionOutput.textContent;
  if (!textToCopy) return;

  try {
    await navigator.clipboard.writeText(textToCopy);
    copyFeedback.textContent = "Caption berhasil disalin ke clipboard!";
    copyFeedback.classList.remove("hidden");
  } catch {
    copyFeedback.textContent = "Silakan salin teks secara manual.";
    copyFeedback.classList.remove("hidden");
  }
});

// Event Listener: Reset Form
captionForm.addEventListener("reset", () => {
  setTimeout(() => {
    hideBanner();
    setFieldError(productNameInput, nameError, "");
    setFieldError(platformSelect, platformError, "");
    setFieldError(keyBenefitInput, benefitError, "");
    setFieldError(hashtagsInput, hashtagError, "");
    nameCounter.textContent = "0 / 80";
    benefitCounter.textContent = "0 / 250";
    copyFeedback.classList.add("hidden");
  }, 0);
});

// Event Listener: Hapus Riwayat
clearHistoryBtn.addEventListener("click", () => {
  captionHistory = [];
  renderHistory();
});