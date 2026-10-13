"use client";

import { useEffect, useRef } from "react";

const PORTAL_URL = ""; // Add the real portal sign-in URL before publishing.

export default function SiteClient({ markup }: { markup: string }) {
  useEffect(() => {
    const menuButton = document.querySelector<HTMLButtonElement>(".menu");
    const nav = document.querySelector<HTMLElement>("#nav");
    const onMenu = () => {
      if (!menuButton || !nav) return;
      const open = nav.classList.toggle("open");
      menuButton.setAttribute("aria-expanded", String(open));
      menuButton.setAttribute("aria-label", open ? "Close navigation" : "Open navigation");
      menuButton.textContent = open ? "×" : "☰";
    };
    menuButton?.addEventListener("click", onMenu);
    const navLinks = nav ? Array.from(nav.querySelectorAll("a")) : [];
    const closeNav = () => {
      nav?.classList.remove("open");
      menuButton?.setAttribute("aria-expanded", "false");
      if (menuButton) menuButton.textContent = "☰";
    };
    navLinks.forEach((link) => link.addEventListener("click", closeNav));

    const filterButtons = Array.from(document.querySelectorAll<HTMLButtonElement>(".filters button"));
    const onFilter = (event: Event) => {
      const button = event.currentTarget as HTMLButtonElement;
      const category = button.dataset.filter;
      filterButtons.forEach((item) => {
        const active = item === button;
        item.classList.toggle("active", active);
        item.setAttribute("aria-pressed", String(active));
      });
      document.querySelectorAll<HTMLElement>(".gallerycard").forEach((card) => {
        card.hidden = category !== "all" && card.dataset.category !== category;
      });
    };
    filterButtons.forEach((button) => button.addEventListener("click", onFilter));

    const form = document.querySelector<HTMLFormElement>("#contactform");
    const status = document.querySelector<HTMLElement>("#formstatus");
    const submitButton = form?.querySelector<HTMLButtonElement>('button[type="submit"]');
    const formNote = form?.querySelector<HTMLElement>(".formnote");
    if (submitButton) submitButton.textContent = "Send message →";
    if (formNote) {
      formNote.textContent = "Your message will be sent to FalconAid Tech. This website does not store it.";
    }
    const onSubmit = async (event: Event) => {
      event.preventDefault();
      if (!form || !status || !submitButton) return;
      const data = new FormData(form);
      submitButton.disabled = true;
      submitButton.textContent = "Sending...";
      status.textContent = "Sending your message to FalconAid Tech...";
      try {
        const response = await fetch("/api/contact", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            name: String(data.get("name") ?? ""),
            email: String(data.get("email") ?? ""),
            interest: String(data.get("interest") ?? ""),
            message: String(data.get("message") ?? ""),
          }),
        });
        const result: unknown = await response.json();
        const responseMessage =
          typeof result === "object" && result !== null && "error" in result &&
          typeof result.error === "string"
            ? result.error
            : "We couldn't send your message. Please try again or email falconaid.tech@gmail.com.";

        if (!response.ok) {
          status.textContent = responseMessage;
          return;
        }

        status.textContent = "Your message has been sent to FalconAid Tech. Thank you for reaching out.";
        form.reset();
      } catch {
        status.textContent = "We couldn't reach the email service. Please try again or email falconaid.tech@gmail.com.";
      } finally {
        submitButton.disabled = false;
        submitButton.textContent = "Send message →";
      }
    };
    form?.addEventListener("submit", onSubmit);

    const year = document.querySelector<HTMLElement>("#year");
    if (year) year.textContent = String(new Date().getFullYear());
    const portal = document.querySelector<HTMLAnchorElement>("#portallink");
    const onPortal = (event: Event) => {
      if (PORTAL_URL) return;
      event.preventDefault();
      if (status) status.textContent = "Add your real portal URL to PORTAL_URL in app/site-client.tsx to activate this link.";
      form?.scrollIntoView({ behavior: "smooth", block: "center" });
    };
    if (portal && PORTAL_URL) portal.href = PORTAL_URL;
    portal?.addEventListener("click", onPortal);

    return () => {
      menuButton?.removeEventListener("click", onMenu);
      navLinks.forEach((link) => link.removeEventListener("click", closeNav));
      filterButtons.forEach((button) => button.removeEventListener("click", onFilter));
      form?.removeEventListener("submit", onSubmit);
      portal?.removeEventListener("click", onPortal);
    };
  }, []);

  useEffect(() => {
    document.querySelector(".editnote")?.remove();

    const createConceptImage = (alt: string) => {
      const image = document.createElement("img");
      image.className = "concept-product-photo";
      image.src = "/smartaid-kit-concept.png";
      image.alt = alt;
      return image;
    };

    const solutionVisual = document.querySelector<HTMLElement>(".solutionvisual");
    if (solutionVisual) {
      const note = document.createElement("small");
      note.className = "visualnote";
      note.textContent = "PRODUCT CONCEPT. FINISHED PRODUCT PHOTO COMING SOON.";
      solutionVisual.replaceChildren(
        createConceptImage("Open SmartAid Kit product concept with organized first-aid supplies"),
        note,
      );
    }

    const galleryArt = document.querySelector<HTMLElement>('.gallerycard[data-category="product"] .art');
    galleryArt?.replaceChildren(createConceptImage("SmartAid Kit concept image shared by FalconAid Tech"));
    const galleryDescription = document.querySelector<HTMLElement>(
      '.gallerycard[data-category="product"] .galleryinfo p',
    );
    if (galleryDescription) {
      galleryDescription.textContent =
        "An early SmartAid Kit product concept. A photo of the finished product will replace this image when available.";
    }
  }, []);

  return (
    <>
      <div dangerouslySetInnerHTML={{ __html: markup }} />
      <FalconFlight />
    </>
  );
}

function FalconFlight() {
  const falconRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const falcon = falconRef.current;
    if (!falcon || !window.matchMedia("(hover: hover) and (pointer: fine)").matches) return;

    const root = document.documentElement;
    const interactiveSelector = "a, button, [role='button'], input[type='submit'], summary";
    const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    let animationFrame = 0;
    let pointerFrame = 0;
    let hideTimer = 0;
    let landingTimer = 0;
    let previousScrollY = window.scrollY;
    let hoveredTarget: Element | null = null;
    let pointerX = 0;
    let pointerY = 0;

    const placeAtPointer = () => {
      falcon.style.transform = `translate3d(${pointerX - 45}px, ${pointerY - 6}px, 0)`;
    };
    const leaveTarget = () => {
      if (!hoveredTarget) return;
      hoveredTarget = null;
      falcon.classList.remove("falcon-flight-perched");
      root.classList.remove("falcon-cursor-active");
      landingTimer = window.setTimeout(() => {
        if (!hoveredTarget) falcon.classList.remove("falcon-flight-visible");
      }, 180);
    };
    const landOnTarget = (target: Element) => {
      hoveredTarget = target;
      window.clearTimeout(hideTimer);
      window.clearTimeout(landingTimer);
      root.classList.add("falcon-cursor-active");
      falcon.classList.remove("falcon-flight-perched");
      falcon.classList.add("falcon-flight-visible");
      falcon.style.transform = `translate3d(${pointerX - 112}px, ${pointerY - 42}px, 0)`;
      window.requestAnimationFrame(() => {
        if (hoveredTarget !== target) return;
        falcon.classList.add("falcon-flight-perched");
        placeAtPointer();
      });
    };

    const updateFlight = () => {
      animationFrame = 0;
      if (hoveredTarget) return;
      const scrollY = window.scrollY;
      const travel = window.innerWidth + 100;
      const phase = (scrollY * 0.32) % (travel * 2);
      const distance = phase <= travel ? phase : travel * 2 - phase;
      const movingDown = scrollY >= previousScrollY;
      const movingRight = phase <= travel ? movingDown : !movingDown;
      const x = distance - 50;
      const y = 90 + Math.sin(scrollY / 370) * 42;

      falcon.style.transform = `translate3d(${x}px, ${y}px, 0) scaleX(${movingRight ? 1 : -1})`;
      falcon.classList.add("falcon-flight-visible");
      previousScrollY = scrollY;

      window.clearTimeout(hideTimer);
      hideTimer = window.setTimeout(() => {
        falcon.classList.remove("falcon-flight-visible");
      }, 900);
    };

    const onScroll = () => {
      if (reducedMotion.matches || animationFrame) return;
      animationFrame = window.requestAnimationFrame(updateFlight);
    };
    const onPointerMove = (event: PointerEvent) => {
      pointerX = event.clientX;
      pointerY = event.clientY;
      const target = document.elementFromPoint(pointerX, pointerY)?.closest(interactiveSelector) ?? null;
      if (target !== hoveredTarget) {
        if (target) landOnTarget(target);
        else leaveTarget();
      }
      if (!hoveredTarget) return;
      if (!pointerFrame) {
        pointerFrame = window.requestAnimationFrame(() => {
          pointerFrame = 0;
          if (hoveredTarget) placeAtPointer();
        });
      }
    };
    const onPointerLeave = () => leaveTarget();

    window.addEventListener("scroll", onScroll, { passive: true });
    document.addEventListener("pointermove", onPointerMove, { passive: true });
    document.addEventListener("pointerleave", onPointerLeave);

    return () => {
      window.removeEventListener("scroll", onScroll);
      document.removeEventListener("pointermove", onPointerMove);
      document.removeEventListener("pointerleave", onPointerLeave);
      window.cancelAnimationFrame(animationFrame);
      window.cancelAnimationFrame(pointerFrame);
      window.clearTimeout(hideTimer);
      window.clearTimeout(landingTimer);
      root.classList.remove("falcon-cursor-active");
    };
  }, []);

  return (
    <div ref={falconRef} className="falcon-flight" aria-hidden="true">
      <svg viewBox="0 0 180 120" focusable="false">
        <defs>
          <linearGradient id="falcon-back" x1="0" x2="1" y1="0" y2="1">
            <stop offset="0" stopColor="#52677a" />
            <stop offset=".48" stopColor="#263a4d" />
            <stop offset="1" stopColor="#152433" />
          </linearGradient>
          <linearGradient id="falcon-breast" x1="0" x2=".85" y1="0" y2="1">
            <stop offset="0" stopColor="#fffdf6" />
            <stop offset="1" stopColor="#b9c2c6" />
          </linearGradient>
        </defs>
        <path className="falcon-tail" d="M63 67 8 47l47 31L16 91l57-15z" />
        <path className="falcon-tail-feather" d="m61 70-42-17m43 20L27 85m35-14L36 74" />
        <g className="falcon-wing-group falcon-wing-away">
          <path className="falcon-wing falcon-wing-back" d="M82 67C68 48 48 25 48 7c13 6 24 16 34 28C76 20 74 9 78 2c15 12 25 27 32 47l15 13z" />
          <path className="falcon-wing-feather" d="M53 11c17 12 30 28 42 48M57 22c15 10 27 23 38 40M64 34c13 8 23 18 33 31M75 45c9 6 16 13 23 22M81 7c12 15 21 30 27 48" />
        </g>
        <path className="falcon-body" d="M47 69c13-11 25-17 40-21 16-5 30-2 43-5 10-3 17-9 24-18l8-1-5 12c-4 9-11 15-20 19-3 13-13 23-28 29-17 7-37 8-53 1L47 69z" />
        <path className="falcon-breast" d="M92 57c15-6 29-7 44-9-4 14-13 24-27 30-11 5-23 6-34 4 8-6 13-14 17-25z" />
        <path className="falcon-barred" d="m92 68 14-2-9 6zm13 7 13-4-8 8zm14-13 13-3-8 8zm-35 16 11-4-6 8z" />
        <g className="falcon-wing-group falcon-wing-near">
          <path className="falcon-wing falcon-wing-front" d="M88 66C76 47 67 25 72 8c12 10 21 23 28 38C98 29 98 17 103 9c12 15 19 31 22 51l14 2-27 14z" />
          <path className="falcon-wing-feather" d="M77 15c11 14 20 29 26 46M76 29c10 10 18 21 24 34M79 42c8 7 14 16 19 25M103 16c8 14 13 28 16 45M107 31c6 10 9 19 12 29" />
        </g>
        <path className="falcon-head" d="M135 35c4-10 12-16 22-16l11 6 7-2-8 11c-6 6-14 8-23 7l-7 7z" />
        <path className="falcon-crown" d="M139 32c5-9 12-12 20-10l9 5-9 4-8-2-9 7z" />
        <path className="falcon-beak" d="m169 24 10-2-5 8-7 2z" />
        <path className="falcon-cere" d="m165 28 5-1 2 4-5 3z" />
        <circle className="falcon-eye-ring" cx="158" cy="29" r="3.1" />
        <circle className="falcon-eye" cx="158" cy="29" r="1.45" />
        <path className="falcon-moustache" d="M156 33c5 2 10 6 12 13-5-3-10-4-15-2l-5-5z" />
        <path className="falcon-throat" d="M144 42c6 2 11 2 16 1-5 4-10 5-15 3z" />
        <path className="falcon-leg" d="m112 82 1 7-6 4m6-4 5 3m15-16 1 7-5 4m5-4 5 3" />
        <path className="falcon-talon" d="m107 93-5 2 5-5m10 5 5 1-5-4m10-3-5 4 6-1m10 2 5 1-5-4" />
      </svg>
    </div>
  );
}
