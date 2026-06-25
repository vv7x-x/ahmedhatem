(() => {
  "use strict";

  const CONFIG = {
    coachWhatsAppNumber: "201065421158",
    maxFileSizeBytes: 5 * 1024 * 1024,
    acceptedExtensions: ["jpg", "jpeg", "png", "webp", "heic", "heif"],
    loadingDelayMs: 650,
    toastDurationMs: 3600,
    particleCount: 24
  };

  const SCROLL_CONFIG = { threshold: 0.08, rootMargin: "0px 0px -40px 0px" };

  const state = {
    selectedPackage: null,
    uploadedFile: null,
    previewUrl: "",
    user: {
      fullName: "",
      phoneNumber: ""
    },
    lastFocusedElement: null
  };

  const selectors = {
    packageCards: ".package-card",
    subscribeButtons: ".subscribe-btn",
    modal: "#subscriptionModal",
    dialog: ".modal__dialog",
    closeControls: "[data-modal-close]",
    selectedPackageLabel: "#selectedPackageLabel",
    selectedPackageMeta: "#selectedPackageMeta",
    checkoutStep: "#checkoutStep",
    confirmationStep: "#confirmationStep",
    customerForm: "#customerForm",
    fullName: "#fullName",
    phoneNumber: "#phoneNumber",
    paymentProof: "#paymentProof",
    uploadBox: "#uploadBox",
    uploadPlaceholder: "#uploadPlaceholder",
    uploadLoading: "#uploadLoading",
    uploadPreview: "#uploadPreview",
    uploadPreviewImage: "#uploadPreviewImage",
    uploadFileName: "#uploadFileName",
    uploadFileMeta: "#uploadFileMeta",
    proofCommitment: "#proofCommitment",
    openWhatsAppBtn: "#openWhatsAppBtn",
    changeScreenshotBtn: "#changeScreenshotBtn",
    confirmationImage: "#confirmationImage",
    confirmPackage: "#confirmPackage",
    confirmPrice: "#confirmPrice",
    confirmDuration: "#confirmDuration",
    confirmName: "#confirmName",
    confirmPhone: "#confirmPhone",
    toastRegion: "#toastRegion"
  };

  const elements = {};

  document.addEventListener("DOMContentLoaded", init);

  function init() {
    cacheElements();
    hydrateDefaultPackage();
    bindPackageCards();
    bindModalControls();
    bindCopyButtons();
    bindUploadControls();
    bindForm();
    bindConfirmationControls();
    initScrollReveal();
    initCounters();
    initNavHighlight();
    initProgressBar();
    initMagneticButtons();
    initParallaxCards();
    initTypewriter();
    initRipple();
    initNavScroll();
    initNavToggle();
  }

  function cacheElements() {
    elements.packageCards = Array.from(document.querySelectorAll(selectors.packageCards));
    elements.subscribeButtons = Array.from(document.querySelectorAll(selectors.subscribeButtons));
    elements.modal = document.querySelector(selectors.modal);
    elements.dialog = document.querySelector(selectors.dialog);
    elements.closeControls = Array.from(document.querySelectorAll(selectors.closeControls));
    elements.selectedPackageLabel = document.querySelector(selectors.selectedPackageLabel);
    elements.selectedPackageMeta = document.querySelector(selectors.selectedPackageMeta);
    elements.checkoutStep = document.querySelector(selectors.checkoutStep);
    elements.confirmationStep = document.querySelector(selectors.confirmationStep);
    elements.customerForm = document.querySelector(selectors.customerForm);
    elements.fullName = document.querySelector(selectors.fullName);
    elements.phoneNumber = document.querySelector(selectors.phoneNumber);
    elements.paymentProof = document.querySelector(selectors.paymentProof);
    elements.uploadBox = document.querySelector(selectors.uploadBox);
    elements.uploadPlaceholder = document.querySelector(selectors.uploadPlaceholder);
    elements.uploadLoading = document.querySelector(selectors.uploadLoading);
    elements.uploadPreview = document.querySelector(selectors.uploadPreview);
    elements.uploadPreviewImage = document.querySelector(selectors.uploadPreviewImage);
    elements.uploadFileName = document.querySelector(selectors.uploadFileName);
    elements.uploadFileMeta = document.querySelector(selectors.uploadFileMeta);
    elements.proofCommitment = document.querySelector(selectors.proofCommitment);
    elements.openWhatsAppBtn = document.querySelector(selectors.openWhatsAppBtn);
    elements.changeScreenshotBtn = document.querySelector(selectors.changeScreenshotBtn);
    elements.confirmationImage = document.querySelector(selectors.confirmationImage);
    elements.confirmPackage = document.querySelector(selectors.confirmPackage);
    elements.confirmPrice = document.querySelector(selectors.confirmPrice);
    elements.confirmDuration = document.querySelector(selectors.confirmDuration);
    elements.confirmName = document.querySelector(selectors.confirmName);
    elements.confirmPhone = document.querySelector(selectors.confirmPhone);
    elements.toastRegion = document.querySelector(selectors.toastRegion);
  }

  function hydrateDefaultPackage() {
    const selectedCard = document.querySelector(".package-card.is-selected") || elements.packageCards[0];
    if (!selectedCard) return;
    selectPackage(selectedCard, { silent: true });
  }

  function bindPackageCards() {
    elements.packageCards.forEach((card) => {
      card.addEventListener("click", (event) => {
        const clickedSubscribe = event.target.closest(selectors.subscribeButtons);
        selectPackage(card);
        if (clickedSubscribe) {
          openModal();
        }
      });

      card.addEventListener("keydown", (event) => {
        if (event.key === "Enter" || event.key === " ") {
          event.preventDefault();
          selectPackage(card);
          openModal();
        }
      });
    });
  }

  function selectPackage(card, options = {}) {
    if (!card) return;
    elements.packageCards.forEach((packageCard) => {
      const isCurrent = packageCard === card;
      packageCard.classList.toggle("is-selected", isCurrent);
      packageCard.setAttribute("aria-selected", String(isCurrent));
    });

    state.selectedPackage = {
      name: card.dataset.packageName || "Selected Package",
      price: card.dataset.price || "",
      duration: card.dataset.duration || ""
    };

    updateSelectedPackageUI();

    if (!options.silent) {
      showToast(`${state.selectedPackage.name} selected`, "success");
    }
  }

  function updateSelectedPackageUI() {
    if (!state.selectedPackage) return;
    elements.selectedPackageLabel.textContent = state.selectedPackage.name;
    elements.selectedPackageMeta.textContent = `${state.selectedPackage.price} • ${state.selectedPackage.duration}`;
  }

  function bindModalControls() {
    elements.closeControls.forEach((control) => {
      control.addEventListener("click", closeModal);
    });

    document.addEventListener("keydown", (event) => {
      if (elements.modal.hidden) return;
      if (event.key === "Escape") {
        closeModal();
        return;
      }
      if (event.key === "Tab") {
        trapModalFocus(event);
      }
    });
  }

  function openModal() {
    if (!state.selectedPackage && elements.packageCards[0]) {
      selectPackage(elements.packageCards[0], { silent: true });
    }

    state.lastFocusedElement = document.activeElement;
    resetCheckoutView({ keepFormValues: false });
    updateSelectedPackageUI();

    elements.modal.hidden = false;
    elements.modal.setAttribute("aria-hidden", "false");
    document.body.classList.add("modal-open");

    requestAnimationFrame(() => {
      elements.dialog.focus({ preventScroll: true });
    });
  }

  function closeModal() {
    elements.modal.hidden = true;
    elements.modal.setAttribute("aria-hidden", "true");
    document.body.classList.remove("modal-open");

    if (state.lastFocusedElement && typeof state.lastFocusedElement.focus === "function") {
      state.lastFocusedElement.focus({ preventScroll: true });
    }
  }

  function trapModalFocus(event) {
    const focusable = Array.from(
      elements.dialog.querySelectorAll(
        "a[href], button:not([disabled]), textarea, input:not([disabled]), select, [tabindex]:not([tabindex='-1'])"
      )
    ).filter((node) => node.offsetParent !== null || node === document.activeElement);

    if (!focusable.length) return;

    const firstElement = focusable[0];
    const lastElement = focusable[focusable.length - 1];

    if (event.shiftKey && document.activeElement === firstElement) {
      event.preventDefault();
      lastElement.focus();
    } else if (!event.shiftKey && document.activeElement === lastElement) {
      event.preventDefault();
      firstElement.focus();
    }
  }

  function bindCopyButtons() {
    document.addEventListener("click", async (event) => {
      const button = event.target.closest(".copy-button");
      if (!button) return;

      const targetId = button.dataset.copyTarget;
      const target = targetId ? document.getElementById(targetId) : null;
      const text = target?.textContent?.trim();

      if (!text) {
        showToast("Nothing to copy", "error");
        return;
      }

      const copied = await copyToClipboard(text);
      if (copied) {
        button.textContent = "Copied";
        showToast("Payment details copied", "success");
        window.setTimeout(() => {
          button.textContent = "Copy";
        }, 1400);
      } else {
        showToast("Copy failed. Please copy manually.", "error");
      }
    });
  }

  async function copyToClipboard(text) {
    if (navigator.clipboard && window.isSecureContext) {
      try {
        await navigator.clipboard.writeText(text);
        return true;
      } catch (error) {}
    }

    const tempInput = document.createElement("textarea");
    tempInput.value = text;
    tempInput.setAttribute("readonly", "");
    tempInput.style.position = "fixed";
    tempInput.style.opacity = "0";
    tempInput.style.pointerEvents = "none";
    document.body.appendChild(tempInput);
    tempInput.select();

    let successful = false;
    try {
      successful = document.execCommand("copy");
    } catch (error) {
      successful = false;
    }

    tempInput.remove();
    return successful;
  }

  function bindUploadControls() {
    elements.uploadBox.addEventListener("click", (event) => {
      if (event.target.closest("input")) return;
      elements.paymentProof.click();
    });

    elements.uploadBox.addEventListener("keydown", (event) => {
      if (event.key === "Enter" || event.key === " ") {
        event.preventDefault();
        elements.paymentProof.click();
      }
    });

    elements.paymentProof.addEventListener("change", (event) => {
      const [file] = Array.from(event.target.files || []);
      handleSelectedFile(file);
    });

    ["dragenter", "dragover"].forEach((eventName) => {
      elements.uploadBox.addEventListener(eventName, (event) => {
        event.preventDefault();
        event.stopPropagation();
        elements.uploadBox.classList.add("is-dragging");
      });
    });

    ["dragleave", "dragend", "drop"].forEach((eventName) => {
      elements.uploadBox.addEventListener(eventName, (event) => {
        event.preventDefault();
        event.stopPropagation();
        elements.uploadBox.classList.remove("is-dragging");
      });
    });

    elements.uploadBox.addEventListener("drop", (event) => {
      const [file] = Array.from(event.dataTransfer?.files || []);
      handleSelectedFile(file);
    });
  }

  function handleSelectedFile(file) {
    clearFieldError("paymentProof");

    if (!file) return;

    const validation = validateFile(file);
    if (!validation.isValid) {
      state.uploadedFile = null;
      state.previewUrl = "";
      resetUploadPreview();
      setFieldError("paymentProof", validation.message);
      showToast(validation.message, "error");
      return;
    }

    state.uploadedFile = file;
    setUploadLoading(true);

    const reader = new FileReader();

    reader.onload = () => {
      window.setTimeout(() => {
        state.previewUrl = String(reader.result || "");
        renderUploadPreview(file, state.previewUrl);
        setUploadLoading(false);
        showToast("Screenshot ready for review", "success");
      }, CONFIG.loadingDelayMs);
    };

    reader.onerror = () => {
      state.uploadedFile = null;
      state.previewUrl = "";
      resetUploadPreview();
      setUploadLoading(false);
      setFieldError("paymentProof", "We could not read this image. Please upload another screenshot.");
      showToast("Image preview failed. Please try another file.", "error");
    };

    reader.readAsDataURL(file);
  }

  function validateFile(file) {
    const extension = getFileExtension(file.name);
    const hasValidMime = file.type ? file.type.toLowerCase().startsWith("image/") : false;
    const hasValidExtension = CONFIG.acceptedExtensions.includes(extension);

    if (!hasValidMime && !hasValidExtension) {
      return { isValid: false, message: "Please upload a valid image file: JPG, PNG, WEBP, HEIC, or HEIF." };
    }

    if (file.size > CONFIG.maxFileSizeBytes) {
      return { isValid: false, message: "The screenshot is too large. Please upload an image under 5MB." };
    }

    return { isValid: true, message: "" };
  }

  function getFileExtension(fileName = "") {
    return fileName.split(".").pop()?.toLowerCase() || "";
  }

  function setUploadLoading(isLoading) {
    elements.uploadPlaceholder.hidden = true;
    elements.uploadPreview.hidden = true;
    elements.uploadLoading.hidden = !isLoading;

    if (!isLoading && state.previewUrl) {
      elements.uploadPreview.hidden = false;
    }
  }

  function renderUploadPreview(file, previewUrl) {
    elements.uploadPreviewImage.src = previewUrl;
    elements.uploadFileName.textContent = file.name;
    elements.uploadFileMeta.textContent = `${formatBytes(file.size)} • Ready for confirmation`;
    elements.uploadPlaceholder.hidden = true;
    elements.uploadLoading.hidden = true;
    elements.uploadPreview.hidden = false;
  }

  function resetUploadPreview() {
    elements.paymentProof.value = "";
    elements.uploadPreviewImage.removeAttribute("src");
    elements.uploadFileName.textContent = "";
    elements.uploadFileMeta.textContent = "";
    elements.uploadPlaceholder.hidden = false;
    elements.uploadLoading.hidden = true;
    elements.uploadPreview.hidden = true;
  }

  function formatBytes(bytes) {
    if (!Number.isFinite(bytes) || bytes <= 0) return "0 KB";

    const units = ["B", "KB", "MB", "GB"];
    const unitIndex = Math.min(Math.floor(Math.log(bytes) / Math.log(1024)), units.length - 1);
    const value = bytes / Math.pow(1024, unitIndex);
    return `${value.toFixed(value >= 10 || unitIndex === 0 ? 0 : 1)} ${units[unitIndex]}`;
  }

  function bindForm() {
    elements.customerForm.addEventListener("submit", (event) => {
      event.preventDefault();

      const validation = validateForm();
      if (!validation.isValid) {
        focusFirstInvalidField();
        showToast("Please complete the required information", "error");
        return;
      }

      state.user.fullName = elements.fullName.value.trim();
      state.user.phoneNumber = elements.phoneNumber.value.trim();
      renderConfirmation();
      showConfirmationStep();
    });

    elements.fullName.addEventListener("input", () => clearFieldError("fullName"));
    elements.phoneNumber.addEventListener("input", () => clearFieldError("phoneNumber"));
  }

  function validateForm() {
    let isValid = true;
    const fullName = elements.fullName.value.trim();
    const phoneNumber = elements.phoneNumber.value.trim();

    clearAllFieldErrors();

    if (fullName.length < 2) {
      isValid = false;
      setFieldError("fullName", "Please enter your full name.");
    }

    if (!isValidPhone(phoneNumber)) {
      isValid = false;
      setFieldError("phoneNumber", "Please enter a valid phone number.");
    }

    if (!state.uploadedFile || !state.previewUrl) {
      isValid = false;
      setFieldError("paymentProof", "Please upload your payment screenshot.");
    }

    return { isValid };
  }

  function isValidPhone(value) {
    const normalized = value.replace(/[\s()-]/g, "");
    return /^\+?\d{8,15}$/.test(normalized);
  }

  function setFieldError(field, message) {
    const input = getInputByField(field);
    const errorNode = document.getElementById(`${field}Error`);

    if (input) {
      input.classList.add("is-invalid");
      input.setAttribute("aria-invalid", "true");
    }

    if (field === "paymentProof") {
      elements.uploadBox.setAttribute("aria-invalid", "true");
    }

    if (errorNode) {
      errorNode.textContent = message;
    }
  }

  function clearFieldError(field) {
    const input = getInputByField(field);
    const errorNode = document.getElementById(`${field}Error`);

    if (input) {
      input.classList.remove("is-invalid");
      input.removeAttribute("aria-invalid");
    }

    if (field === "paymentProof") {
      elements.uploadBox.removeAttribute("aria-invalid");
    }

    if (errorNode) {
      errorNode.textContent = "";
    }
  }

  function clearAllFieldErrors() {
    ["fullName", "phoneNumber", "paymentProof"].forEach(clearFieldError);
  }

  function getInputByField(field) {
    const fieldMap = {
      fullName: elements.fullName,
      phoneNumber: elements.phoneNumber,
      paymentProof: elements.paymentProof
    };
    return fieldMap[field];
  }

  function focusFirstInvalidField() {
    if (elements.fullName.classList.contains("is-invalid")) {
      elements.fullName.focus({ preventScroll: false });
      return;
    }
    if (elements.phoneNumber.classList.contains("is-invalid")) {
      elements.phoneNumber.focus({ preventScroll: false });
      return;
    }
    if (elements.uploadBox.getAttribute("aria-invalid") === "true") {
      elements.uploadBox.focus({ preventScroll: false });
    }
  }

  function renderConfirmation() {
    elements.confirmationImage.src = state.previewUrl;
    elements.confirmPackage.textContent = state.selectedPackage?.name || "Selected Package";
    elements.confirmPrice.textContent = state.selectedPackage?.price || "-";
    elements.confirmDuration.textContent = state.selectedPackage?.duration || "-";
    elements.confirmName.textContent = state.user.fullName;
    elements.confirmPhone.textContent = state.user.phoneNumber;
    elements.proofCommitment.checked = false;
    elements.openWhatsAppBtn.disabled = true;
  }

  function showConfirmationStep() {
    elements.checkoutStep.hidden = true;
    elements.confirmationStep.hidden = false;
    elements.dialog.scrollTo({ top: 0, behavior: "smooth" });
    showToast("Review your details before WhatsApp", "success");

    window.setTimeout(() => {
      elements.proofCommitment.focus({ preventScroll: true });
    }, 250);
  }

  function bindConfirmationControls() {
    elements.proofCommitment.addEventListener("change", () => {
      elements.openWhatsAppBtn.disabled = !elements.proofCommitment.checked;
    });

    elements.changeScreenshotBtn.addEventListener("click", () => {
      elements.confirmationStep.hidden = true;
      elements.checkoutStep.hidden = false;
      elements.openWhatsAppBtn.disabled = true;
      elements.proofCommitment.checked = false;
      window.setTimeout(() => {
        elements.uploadBox.focus({ preventScroll: false });
      }, 120);
    });

    elements.openWhatsAppBtn.addEventListener("click", openWhatsApp);
  }

  function openWhatsApp() {
    if (!elements.proofCommitment.checked) {
      showToast("Please confirm that you will attach the payment proof in WhatsApp.", "error");
      return;
    }

    const message = buildWhatsAppMessage();
    const whatsappUrl = `https://wa.me/${CONFIG.coachWhatsAppNumber}?text=${encodeURIComponent(message)}`;

    window.open(whatsappUrl, "_blank", "noopener,noreferrer");
    showToast("WhatsApp opened. Attach the payment screenshot inside the chat.", "success");
  }

  function buildWhatsAppMessage() {
    const packageName = state.selectedPackage?.name || "";
    const fullName = state.user.fullName || "";
    const phoneNumber = state.user.phoneNumber || "";

    return `السلام عليكم كابتن

أرغب في الاشتراك في باقة:

${packageName}

الاسم:

${fullName}

رقم الهاتف:

${phoneNumber}

⚠️ سأقوم بإرفاق صورة إثبات الدفع مع هذه الرسالة.

برجاء مراجعة الطلب وتأكيد الاشتراك.`;
  }

  function resetCheckoutView({ keepFormValues = false } = {}) {
    elements.checkoutStep.hidden = false;
    elements.confirmationStep.hidden = true;
    elements.proofCommitment.checked = false;
    elements.openWhatsAppBtn.disabled = true;
    clearAllFieldErrors();

    if (!keepFormValues) {
      elements.customerForm.reset();
      state.uploadedFile = null;
      state.previewUrl = "";
      state.user.fullName = "";
      state.user.phoneNumber = "";
      resetUploadPreview();
    }
  }

  function showToast(message, type = "success") {
    const toast = document.createElement("div");
    toast.className = `toast toast--${type}`;
    toast.setAttribute("role", type === "error" ? "alert" : "status");
    toast.textContent = message;

    elements.toastRegion.appendChild(toast);

    window.setTimeout(() => {
      toast.style.opacity = "0";
      toast.style.transform = "translateY(12px)";
      toast.style.transition = "opacity 220ms var(--ease-mass), transform 220ms var(--ease-mass)";
    }, CONFIG.toastDurationMs - 250);

    window.setTimeout(() => {
      toast.remove();
    }, CONFIG.toastDurationMs);
  }

  /* ─── Scroll Reveal (fade + blur) ─── */
  function initScrollReveal() {
    const targets = document.querySelectorAll(".reveal-fade");
    if (!targets.length) return;
    if (!("IntersectionObserver" in window)) {
      targets.forEach((el) => el.classList.add("is-visible"));
      return;
    }
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting) {
          entry.target.classList.add("is-visible");
          obs.unobserve(entry.target);
        }
      });
    }, SCROLL_CONFIG);
    targets.forEach((t) => obs.observe(t));
  }

  /* ─── Counter Animation ─── */
  function initCounters() {
    const counters = document.querySelectorAll(".trust-strip strong, .trust-metrics strong");
    if (!counters.length || !("IntersectionObserver" in window)) return;
    let started = false;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (entry.isIntersecting && !started) {
          started = true;
          counters.forEach((el) => {
            const text = el.textContent.replace(/[+\-%]/g, "");
            const suffix = el.textContent.includes("+") ? "+" : el.textContent.includes("%") ? "%" : "";
            const target = parseFloat(text.replace(/[^0-9.]/g, ""));
            if (isNaN(target) || target === 0) return;
            animateCounter(el, target, suffix);
          });
          obs.unobserve(entry.target);
        }
      });
    }, { threshold: 0.5 });
    const parent = counters[0]?.closest(".trust-strip, .trust-metrics, .trust__card");
    if (parent) obs.observe(parent); else if (counters[0]) obs.observe(counters[0]);
  }

  function animateCounter(el, target, suffix = "") {
    const duration = 1600;
    const start = performance.now();
    function tick(now) {
      const t = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - t, 3);
      const val = Math.round(eased * target);
      el.textContent = val + suffix;
      if (t < 1) requestAnimationFrame(tick);
    }
    requestAnimationFrame(tick);
  }

  /* ─── Nav Highlight ─── */
  function initNavHighlight() {
    const sections = document.querySelectorAll("section[id]");
    const links = document.querySelectorAll(".nav__links a");
    if (!sections.length || !links.length || !("IntersectionObserver" in window)) return;
    const obs = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        links.forEach((link) => {
          link.style.color = link.getAttribute("href") === `#${entry.target.id}`
            ? "var(--text)" : "";
        });
      });
    }, { threshold: 0.3, rootMargin: "-80px 0px 0px 0px" });
    sections.forEach((s) => obs.observe(s));
  }

  /* ─── Progress Bar ─── */
  function initProgressBar() {
    const bar = document.getElementById("progressBar");
    if (!bar) return;
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          const scrollTop = window.scrollY;
          const docHeight = document.documentElement.scrollHeight - window.innerHeight;
          const progress = docHeight > 0 ? (scrollTop / docHeight) * 100 : 0;
          bar.style.width = progress + "%";
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /* ─── Magnetic Buttons ─── */
  function initMagneticButtons() {
    const buttons = document.querySelectorAll(".btn--magnetic");
    if (!buttons.length) return;
    buttons.forEach((btn) => {
      btn.addEventListener("mousemove", (e) => {
        const rect = btn.getBoundingClientRect();
        const x = e.clientX - rect.left - rect.width / 2;
        const y = e.clientY - rect.top - rect.height / 2;
        btn.style.transform = `translate(${x * 0.3}px, ${y * 0.3}px)`;
      });
      btn.addEventListener("mouseleave", () => {
        btn.style.transform = "";
      });
    });
  }

  /* ─── 3D Parallax Cards ─── */
  function initParallaxCards() {
    const cards = document.querySelectorAll(".package-card, .process-card");
    if (!cards.length) return;
    cards.forEach((card) => {
      card.addEventListener("mousemove", (e) => {
        const rect = card.getBoundingClientRect();
        const x = (e.clientX - rect.left) / rect.width - 0.5;
        const y = (e.clientY - rect.top) / rect.height - 0.5;
        card.style.transform =
          `perspective(1000px) rotateY(${x * 6}deg) rotateX(${-y * 6}deg) translateY(-6px)`;
      });
      card.addEventListener("mouseleave", () => {
        card.style.transform = "";
      });
    });
  }

  /* ─── Typewriter Effect ─── */
  function initTypewriter() {
    const el = document.getElementById("typewriter");
    if (!el) return;
    const text = el.textContent;
    el.textContent = "";
    el.style.display = "inline";
    let i = 0;
    const cursorSpan = document.createElement("span");
    cursorSpan.className = "typewriter-cursor";
    cursorSpan.textContent = "|";
    el.after(cursorSpan);
    function type() {
      if (i < text.length) {
        el.textContent += text.charAt(i);
        i++;
        setTimeout(type, 28 + Math.random() * 30);
      } else {
        cursorSpan.style.animation = "typeCursor 1s step-end infinite";
      }
    }
    setTimeout(type, 600);
  }

  /* ─── Ripple Effect ─── */
  function initRipple() {
    document.addEventListener("click", (e) => {
      const btn = e.target.closest(".btn");
      if (!btn) return;
      const ripple = document.createElement("span");
      ripple.className = "ripple";
      const rect = btn.getBoundingClientRect();
      const size = Math.max(rect.width, rect.height);
      ripple.style.width = ripple.style.height = size + "px";
      ripple.style.left = (e.clientX - rect.left - size / 2) + "px";
      ripple.style.top = (e.clientY - rect.top - size / 2) + "px";
      btn.style.position = "relative";
      btn.style.overflow = "hidden";
      btn.appendChild(ripple);
      setTimeout(() => ripple.remove(), 600);
    });
  }

  /* ─── Nav Scroll Effect ─── */
  function initNavScroll() {
    const nav = document.getElementById("mainNav");
    if (!nav) return;
    let lastScroll = 0;
    const checkScroll = () => {
      const cur = window.scrollY;
      if (cur < 80) {
        nav.removeAttribute("data-hidden");
      } else if (cur > lastScroll) {
        nav.setAttribute("data-hidden", "");
      } else {
        nav.removeAttribute("data-hidden");
      }
      lastScroll = cur;
    };
    checkScroll();
    let ticking = false;
    window.addEventListener("scroll", () => {
      if (!ticking) {
        requestAnimationFrame(() => {
          checkScroll();
          ticking = false;
        });
        ticking = true;
      }
    });
  }

  /* ─── Nav Hamburger Toggle ─── */
  function initNavToggle() {
    const toggle = document.getElementById("navToggle");
    const overlay = document.getElementById("navOverlay");
    if (!toggle || !overlay) return;
    const closeOverlay = () => {
      toggle.setAttribute("aria-expanded", "false");
      overlay.setAttribute("aria-hidden", "true");
      overlay.removeAttribute("open");
      document.body.style.overflow = "";
    };
    const openOverlay = () => {
      toggle.setAttribute("aria-expanded", "true");
      overlay.removeAttribute("aria-hidden");
      overlay.setAttribute("open", "");
      document.body.style.overflow = "hidden";
    };
    toggle.addEventListener("click", () => {
      const expanded = toggle.getAttribute("aria-expanded") === "true";
      expanded ? closeOverlay() : openOverlay();
    });
    overlay.addEventListener("click", (e) => {
      if (e.target === overlay) closeOverlay();
    });
    document.querySelectorAll("[data-nav-close]").forEach((el) => {
      el.addEventListener("click", closeOverlay);
    });
    document.addEventListener("keydown", (e) => {
      if (e.key === "Escape" && toggle.getAttribute("aria-expanded") === "true") {
        closeOverlay();
        toggle.focus();
      }
    });
  }

})();
