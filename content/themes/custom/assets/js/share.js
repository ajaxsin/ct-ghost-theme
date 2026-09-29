(function () {
    const modalOverlay = document.getElementById('gh-share-modal');
    if (!modalOverlay) return;

    const closeBtn = modalOverlay.querySelector('[data-share-modal-close]');
    const triggers = document.querySelectorAll('[data-share-dialog-trigger], .gh-button-share');
    const copyInput = modalOverlay.querySelector('[data-share-copy-input]');
    const copyBtn = modalOverlay.querySelector('[data-share-copy-btn]');
    const toast = modalOverlay.querySelector('[data-share-toast]');
    const instagramBtn = modalOverlay.querySelector('[data-share-instagram]');

    let toastTimeout = null;

    function showToast(message) {
        if (!toast) return;
        toast.textContent = message;
        toast.classList.add('is-visible');
        clearTimeout(toastTimeout);
        toastTimeout = setTimeout(function () {
            toast.classList.remove('is-visible');
        }, 3200);
    }

    function openModal(e) {
        if (e) {
            e.preventDefault();
            e.stopPropagation();
        }
        modalOverlay.classList.add('is-open');
        modalOverlay.setAttribute('aria-hidden', 'false');
        document.documentElement.style.overflowY = 'hidden';
    }

    function closeModal() {
        modalOverlay.classList.remove('is-open');
        modalOverlay.setAttribute('aria-hidden', 'true');
        document.documentElement.style.overflowY = '';
        if (toast) toast.classList.remove('is-visible');
    }

    triggers.forEach(function (trigger) {
        trigger.addEventListener('click', openModal);
    });

    if (closeBtn) {
        closeBtn.addEventListener('click', closeModal);
    }

    modalOverlay.addEventListener('click', function (e) {
        if (e.target === modalOverlay) {
            closeModal();
        }
    });

    document.addEventListener('keydown', function (e) {
        if (e.key === 'Escape' && modalOverlay.classList.contains('is-open')) {
            closeModal();
        }
    });

    // Copy Link
    if (copyBtn && copyInput) {
        copyBtn.addEventListener('click', function () {
            copyInput.select();
            copyInput.setSelectionRange(0, 99999);
            const textToCopy = copyInput.value;

            function onCopied() {
                const icon = copyBtn.querySelector('i');
                const span = copyBtn.querySelector('span');
                if (icon) icon.className = 'fa-solid fa-check';
                if (span) span.textContent = 'Copied!';
                copyBtn.classList.add('is-copied');
                showToast('Link copied to clipboard!');

                setTimeout(function () {
                    if (icon) icon.className = 'fa-regular fa-copy';
                    if (span) span.textContent = 'Copy';
                    copyBtn.classList.remove('is-copied');
                }, 2500);
            }

            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(textToCopy).then(onCopied).catch(function () {
                    document.execCommand('copy');
                    onCopied();
                });
            } else {
                document.execCommand('copy');
                onCopied();
            }
        });
    }

    // Instagram share handling
    if (instagramBtn) {
        function fallbackInstagramCopy(url) {
            if (navigator.clipboard && navigator.clipboard.writeText) {
                navigator.clipboard.writeText(url).then(function () {
                    showToast('Link copied! Open Instagram to share.');
                    setTimeout(function () {
                        window.open('https://www.instagram.com/', '_blank');
                    }, 1000);
                }).catch(function () {
                    showToast('Link: ' + url);
                });
            } else {
                showToast('Link copied! Open Instagram to share.');
                setTimeout(function () {
                    window.open('https://www.instagram.com/', '_blank');
                }, 1000);
            }
        }

        instagramBtn.addEventListener('click', function (e) {
            e.preventDefault();
            const shareUrl = instagramBtn.getAttribute('data-url') || window.location.href;
            const shareTitle = instagramBtn.getAttribute('data-title') || document.title;

            const isMobile = /Android|iPhone|iPad|iPod/i.test(navigator.userAgent);

            if (isMobile && navigator.share) {
                navigator.share({
                    title: shareTitle,
                    url: shareUrl
                }).catch(function (err) {
                    if (err.name !== 'AbortError') {
                        fallbackInstagramCopy(shareUrl);
                    }
                });
            } else {
                fallbackInstagramCopy(shareUrl);
            }
        });
    }
})();
