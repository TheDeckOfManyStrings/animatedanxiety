class AnimatedAnxiety {
  static init() {
    console.log("AnimatedAnxiety | Initializing");
    game.animatedAnxiety = this;
    this.registerSettings();
    this.setupHooks();
  }

  static registerSettings() {
    game.settings.register("animatedanxiety", "enabled", {
      name: "Enable Anxiety Effect",
      hint: "Toggle the anxiety effect on/off",
      scope: "client",
      config: true,
      type: Boolean,
      default: true,
      onChange: () => this.updateAnxietyEffect(game.user?.character),
    });

    game.settings.register("animatedanxiety", "maxSpeed", {
      name: "Maximum Animation Speed",
      hint: "How fast the animation pulses at lowest health (in seconds)",
      scope: "client",
      config: true,
      type: Number,
      range: {
        min: 0.1,
        max: 2.0,
        step: 0.1,
      },
      default: 0.6,
      onChange: () => this.updateAnxietyEffect(game.user?.character),
    });

    game.settings.register("animatedanxiety", "blurAmount", {
      name: "Blur Intensity",
      hint: "How far the effect bleeds into the screen (in pixels)",
      scope: "client",
      config: true,
      type: Number,
      range: {
        min: 20,
        max: 400,
        step: 20,
      },
      default: 200,
      onChange: () => this.updateAnxietyEffect(game.user?.character),
    });
  }

  static setupHooks() {
    // Initialize on ready
    Hooks.on("ready", () => {
      console.log("AnimatedAnxiety | Ready");
      // Initial check for character health
      if (game.user?.character) {
        this.updateAnxietyEffect(game.user.character);
      }
    });

    // Watch for actor updates
    Hooks.on("updateActor", (actor, changes) => {
      console.log("AnimatedAnxiety | Actor Update:", changes);
      const userCharacter = game.user?.character;
      if (!userCharacter || actor.id !== userCharacter.id) return;

      // Only update if HP changed
      if (changes.system?.attributes?.hp) {
        this.updateAnxietyEffect(actor);
      }
    });

    // Watch for effects updates
    Hooks.on("updateActiveEffect", (effect, changes, options, userId) => {
      const userCharacter = game.user?.character;
      if (!userCharacter || effect.parent?.id !== userCharacter.id) return;

      this.updateAnxietyEffect(userCharacter);
    });

    // Watch for effects updates
    Hooks.on("createActiveEffect", (effect, options, userId) => {
      console.log("AnimatedAnxiety | Effect Created:", effect);
      const userCharacter = game.user?.character;
      if (!userCharacter || effect.parent?.id !== userCharacter.id) return;
      this.updateAnxietyEffect(userCharacter);
    });

    Hooks.on("deleteActiveEffect", (effect, options, userId) => {
      console.log("AnimatedAnxiety | Effect Deleted:", effect);
      const userCharacter = game.user?.character;
      if (!userCharacter || effect.parent?.id !== userCharacter.id) return;
      this.updateAnxietyEffect(userCharacter);
    });
  }

  static updateAnxietyEffect(actor) {
    try {
      if (!game.settings.get("animatedanxiety", "enabled")) {
        this.clearEffects();
        return;
      }

      const healthPercent = this.getHealthPercentage(actor);
      const isPoisoned = this.checkPoisonedStatus(actor);
      const isUnconscious = this.checkUnconsciousStatus(actor);
      const isBleeding = this.checkBleedingStatus(actor);
      const isBlinded = this.checkBlindedStatus(actor);
      const isCursed = this.checkCursedStatus(actor);
      const isCharmed = this.checkCharmedStatus(actor);
      const isConcentrating = this.checkConcentratingStatus(actor);
      const isDeafened = this.checkDeafenedStatus(actor); // Add this line
      const isDiseased = this.checkDiseasedStatus(actor); // Add this line
      const isFrightened = this.checkFrightenedStatus(actor); // Add this line
      const isGrappled = this.checkGrappledStatus(actor); // Add this line
      const isHiding = this.checkHidingStatus(actor);
      const isPetrified = this.checkPetrifiedStatus(actor);
      const isParalyzed = this.checkParalyzedStatus(actor);
      const isRestrained = this.checkRestrainedStatus(actor);
      const isIncapacitated = this.checkIncapacitatedStatus(actor); // Add this line
      const isDead = this.checkDeadStatus(actor);
      const isBurrowing = this.checkBurrowingStatus(actor); // Add this line
      const isDodging = this.checkDodgeStatus(actor); // Add this line
      const isEthereal = this.checkEtherealStatus(actor); // Add this line
      const isExhausted = this.checkExhaustionStatus(actor); // Add this line
      const isFlying = this.checkFlyingStatus(actor); // Add this line
      const isHovering = this.checkHoveringStatus(actor);
      const isInvisible = this.checkInvisibleStatus(actor); // Add this line
      const isMarked = this.checkMarkedStatus(actor); // Add this line

      const appElement = document.getElementById("interface");
      if (!appElement) {
        console.error("AnimatedAnxiety | Could not find interface element");
        return;
      }

      // Clear all existing effects first
      this.clearEffects();
      appElement.classList.remove(
        "anxiety-effect",
        "poison-effect",
        "unconscious-effect",
        "blinded-effect",
        "concentration-effect",
        "deafened-effect", // Add this line
        "diseased-effect", // Add this line
        "frightened-effect", // Add this line
        "grappled-effect", // Add this line
        "hiding-effect",
        "petrified-effect",
        "paralyzed-effect",
        "restrained-effect",
        "incapacitated-effect", // Add this line
        "dead-effect",
        "burrowing-effect", // Add this line
        "dodge-effect", // Add this line
        "ethereal-effect", // Add this line
        "exhaustion-effect", // Add this line
        "flying-effect", // Add this line
        "hovering-effect", // Add this line
        "invisible-effect", // Add this line
        "marked-effect" // Add this line
      );

      // Handle static effects
      if (healthPercent < 50) {
        appElement.classList.add("anxiety-effect");
      }
      if (isBlinded) {
        appElement.classList.add("blinded-effect");
        this.createBlindedEffect(); // Add this line
      }
      if (isDeafened) {
        // Add this block
        appElement.classList.add("deafened-effect");
        this.createDeafenedRipples();
      }

      // Handle animated effects in order of priority
      if (isDead) {
        appElement.classList.add("dead-effect");
        this.createDeadEffect();
      } else if (isUnconscious) {
        appElement.classList.add("unconscious-effect");
        this.createBubbles("black-inward");
      } else if (isGrappled) {
        // Add this block before other effects
        appElement.classList.add("grappled-effect");
        this.createGrappledEffect();
      } else if (isRestrained) {
        appElement.classList.add("restrained-effect");
        this.createRestrainedEffect();
      } else if (isPetrified) {
        appElement.classList.add("petrified-effect");
        this.createPetrifiedEffect();
      } else if (isParalyzed) {
        appElement.classList.add("paralyzed-effect");
        this.createParalyzedEffect();
      } else if (isHiding) {
        appElement.classList.add("hiding-effect");
        this.createHidingEffect();
      } else if (isPoisoned) {
        appElement.classList.add("poison-effect");
        this.createBubbles("sway");
      } else if (isDiseased) {
        // Add this block
        appElement.classList.add("diseased-effect");
        this.createDiseaseParticles();
      } else if (isFrightened) {
        // Add this block
        appElement.classList.add("frightened-effect");
        this.createFrightenedMarks();
      } else if (isCursed) {
        console.log("AnimatedAnxiety | Creating curse symbols");
        this.createCurseSymbols();
      } else if (isCharmed) {
        console.log("AnimatedAnxiety | Creating heart symbols");
        this.createHearts();
      } else if (isBleeding) {
        this.createBloodStreaks();
      } else if (isConcentrating) {
        console.log("AnimatedAnxiety | Applying concentration effect");
        appElement.classList.add("concentration-effect");
        this.createConcentrationParticles();
      } else if (isDodging) {
        appElement.classList.add("dodge-effect");
        this.createDodgeEffect();
      } else if (isIncapacitated) {
        // Add this block
        appElement.classList.add("incapacitated-effect");
        this.createIncapacitatedEffect();
      } else if (isBurrowing) {
        // Add this block
        appElement.classList.add("burrowing-effect");
        this.createBurrowingEffect();
      } else if (isEthereal) {
        // Add this block
        appElement.classList.add("ethereal-effect");
        this.createEtherealEffect();
      } else if (isExhausted) {
        // Add this block
        appElement.classList.add("exhaustion-effect");
        this.createExhaustionEffect();
      } else if (isMarked) {
        appElement.classList.add("marked-effect");
        this.createMarkedEffect();
      } else if (isInvisible) {
        appElement.classList.add("invisible-effect");
        this.createInvisibleEffect();
      } else if (isHovering) {
        appElement.classList.add("hovering-effect");
        this.createHoveringEffect();
      } else if (isFlying) {
        // Add this block
        appElement.classList.add("flying-effect");
        this.createFlyingEffect();
      }
    } catch (error) {
      console.error("AnimatedAnxiety | Error:", error);
    }
  }

  static clearEffects() {
    if (this.bubbleInterval) {
      clearInterval(this.bubbleInterval);
      this.bubbleInterval = null;
    }
    if (this.bloodInterval) {
      clearInterval(this.bloodInterval);
      this.bloodInterval = null;
    }
    if (this.curseInterval) {
      clearInterval(this.curseInterval);
      this.curseInterval = null;
    }
    if (this.heartInterval) {
      clearInterval(this.heartInterval);
      this.heartInterval = null;
    }
    if (this.particleInterval) {
      clearInterval(this.particleInterval);
      this.particleInterval = null;
    }
    if (this.deafenedInterval) {
      clearInterval(this.deafenedInterval);
      this.deafenedInterval = null;
    }
    if (this.diseaseInterval) {
      clearInterval(this.diseaseInterval);
      this.diseaseInterval = null;
    }
    if (this.frightenedInterval) {
      clearInterval(this.frightenedInterval);
      this.frightenedInterval = null;
    }
    if (this.grappledInterval) {
      clearInterval(this.grappledInterval);
      this.grappledInterval = null;
    }
    if (this.hidingInterval) {
      clearInterval(this.hidingInterval);
      this.hidingInterval = null;
    }
    if (this.petrifiedInterval) {
      clearInterval(this.petrifiedInterval);
      this.petrifiedInterval = null;
    }
    if (this.paralyzedInterval) {
      clearInterval(this.paralyzedInterval);
      this.paralyzedInterval = null;
    }
    if (this.restrainedInterval) {
      clearInterval(this.restrainedInterval);
      this.restrainedInterval = null;
    }
    if (this.deadInterval) {
      clearInterval(this.deadInterval);
      this.deadInterval = null;
    }
    if (this.burrowingInterval) {
      // Add this block
      clearInterval(this.burrowingInterval);
      this.burrowingInterval = null;
    }
    if (this.dodgeInterval) {
      clearInterval(this.dodgeInterval);
      this.dodgeInterval = null;
    }
    if (this.etherealInterval) {
      // Add this block
      clearInterval(this.etherealInterval);
      this.etherealInterval = null;
    }
    if (this.exhaustionInterval) {
      // Add this block
      clearInterval(this.exhaustionInterval);
      this.exhaustionInterval = null;
    }
    if (this.flyingInterval) {
      // Add this block
      clearInterval(this.flyingInterval);
      this.flyingInterval = null;
    }
    if (this.hoveringInterval) {
      // Add this block
      clearInterval(this.hoveringInterval);
      this.hoveringInterval = null;
    }
    if (this.invisibleInterval) {
      clearInterval(this.invisibleInterval);
      this.invisibleInterval = null;
    }
    if (this.markedInterval) {
      clearInterval(this.markedInterval);
      this.markedInterval = null;
    }

    // Clear the timeout as well
    if (this.paralyzedTimeout) {
      clearTimeout(this.paralyzedTimeout);
      this.paralyzedTimeout = null;
    }

    // Remove all animated elements
    document.querySelectorAll(".bubble").forEach((el) => el.remove());
    document.querySelectorAll(".blood-streak").forEach((el) => el.remove());
    document.querySelectorAll(".bleeding-overlay").forEach((el) => el.remove()); // Add this line
    document.querySelectorAll(".curse-symbol").forEach((el) => el.remove());
    document.querySelectorAll(".charm-heart").forEach((el) => el.remove());
    document
      .querySelectorAll(".concentration-particle")
      .forEach((el) => el.remove());
    document
      .querySelectorAll(".concentration-overlay")
      .forEach((el) => el.remove());
    document.querySelectorAll(".deafened-ripple").forEach((el) => el.remove());
    document.querySelectorAll(".deafened-overlay").forEach((el) => el.remove()); // Add this line
    document.querySelectorAll(".disease-particle").forEach((el) => el.remove());
    document.querySelectorAll(".frightened-mark").forEach((el) => el.remove());
    document.querySelectorAll(".grappled-hand").forEach((el) => el.remove());
    document
      .querySelectorAll(".grappled-vignette")
      .forEach((el) => el.remove());
    document.querySelectorAll(".grappled-overlay").forEach((el) => el.remove());
    document.querySelectorAll(".hiding-overlay").forEach((el) => el.remove());
    document
      .querySelectorAll(".petrified-overlay")
      .forEach((el) => el.remove());
    document
      .querySelectorAll(".paralyzed-overlay")
      .forEach((el) => el.remove());
    document.querySelectorAll(".restrained-web").forEach((el) => el.remove());
    document.querySelectorAll(".rats-overlay").forEach((el) => el.remove());
    document.querySelectorAll(".poison-bubble").forEach((el) => el.remove());
    document.querySelectorAll(".poison-overlay").forEach((el) => el.remove());
    document.querySelectorAll(".poison-aura").forEach((el) => el.remove());
    document.querySelectorAll(".cupid-overlay").forEach((el) => el.remove());
    document
      .querySelectorAll(".frightened-overlay")
      .forEach((el) => el.remove());
    document.querySelectorAll(".cursed-overlay").forEach((el) => el.remove());
    document
      .querySelectorAll(".incapacitated-overlay")
      .forEach((el) => el.remove());
    document.querySelectorAll(".dead-overlay").forEach((el) => el.remove());
    document.querySelectorAll(".blinded-overlay").forEach((el) => el.remove());
    document
      .querySelectorAll(".burrowing-overlay")
      .forEach((el) => el.remove()); // Add this line
    document.querySelectorAll(".dodge-overlay").forEach((el) => el.remove());
    document.querySelectorAll(".trapeze-overlay").forEach((el) => el.remove()); // Add this line
    document.querySelectorAll(".ethereal-overlay").forEach((el) => el.remove()); // Add this line
    document
      .querySelectorAll(".exhaustion-overlay")
      .forEach((el) => el.remove()); // Add this line
    document.querySelectorAll(".flying-overlay").forEach((el) => el.remove()); // Add this line
    document.querySelectorAll(".hovering-overlay").forEach((el) => el.remove()); // Add this line
    document.querySelectorAll(".invisible-overlay").forEach((el) => el.remove());
    document.querySelectorAll(".marked-overlay").forEach((el) => el.remove());
  }

  // New check for unconscious
  static checkUnconsciousStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return !e.disabled && name.includes("unconscious");
    });
  }

  // Adjust createBubbles to pick the correct animation
  static createBubbles(mode) {
    if (!this.bubbleInterval) {
      this.clearBubbles();

      if (mode === "sway") {
        // Create poison overlay and aura
        const overlay = document.createElement("div");
        overlay.className = "poison-overlay";
        document.getElementById("interface").appendChild(overlay);

        const aura = document.createElement("div");
        aura.className = "poison-aura";
        document.getElementById("interface").appendChild(aura);

        // Create rising bubbles
        this.bubbleInterval = setInterval(() => {
          const bubble = document.createElement("div");
          bubble.className = "poison-bubble";

          // Random starting position along bottom
          bubble.style.left = `${Math.random() * 100}%`;
          bubble.style.bottom = "0";

          // Random size
          const size = Math.random() * 8 + 4;
          bubble.style.width = `${size}px`;
          bubble.style.height = `${size}px`;

          const duration = Math.random() * 2 + 3;
          bubble.style.animation = `poison-bubble-rise ${duration}s ease-out forwards`;

          document.getElementById("interface").appendChild(bubble);
          setTimeout(() => bubble.remove(), duration * 1000);
        }, 200);
      } else {
        // Original unconscious bubble logic
        this.bubbleInterval = setInterval(() => {
          for (let i = 0; i < 3; i++) {
            const bubble = document.createElement("div");
            bubble.className = "bubble";
            bubble.style.position = "fixed";

            // Random edge
            const edge = ["top", "bottom", "left", "right"][
              Math.floor(Math.random() * 4)
            ];
            let startTop = "50%",
              startLeft = "50%";

            switch (edge) {
              case "top":
                startTop = "0%";
                startLeft = `${Math.random() * 100}%`;
                break;
              case "bottom":
                startTop = "100%";
                startLeft = `${Math.random() * 100}%`;
                break;
              case "left":
                startLeft = "0%";
                startTop = `${Math.random() * 100}%`;
                break;
              case "right":
                startLeft = "100%";
                startTop = `${Math.random() * 100}%`;
                break;
            }

            bubble.style.setProperty("--start-top", startTop);
            bubble.style.setProperty("--start-left", startLeft);

            // Random size
            const size = Math.random() * 8 + 4;
            bubble.style.width = `${size}px`;
            bubble.style.height = `${size}px`;

            const duration =
              mode === "sway"
                ? Math.random() * 2 + 5 // 3–5s for poison
                : Math.random() * 2 + 7; // unchanged for unconscious
            // Switch animation type
            if (mode === "black-inward") {
              bubble.style.background = "rgba(0, 0, 0, 0.4)";
              bubble.style.animation = `bubble-inward-curved ${duration}s ease-in-out forwards`;
            } else if (mode === "sway") {
              bubble.style.background = "rgba(0, 255, 0, 0.4)";
              bubble.style.animation = `bubble-inward-sway ${duration}s linear forwards`;
            }

            document.getElementById("interface").appendChild(bubble);
            setTimeout(() => bubble.remove(), duration * 1000);
          }
        }, 300);
      }
    }
  }

  static clearBubbles() {
    if (this.bubbleInterval) {
      clearInterval(this.bubbleInterval);
      this.bubbleInterval = null;
    }
    document.querySelectorAll(".bubble").forEach((bubble) => bubble.remove());
  }

  static getHealthPercentage(actor) {
    const hp = actor.system.attributes.hp;
    if (!hp) {
      console.error("AnimatedAnxiety | No HP data found");
      return 100;
    }
    return Math.max(0, Math.min(100, (hp.value / hp.max) * 100));
  }

  static getOpacity(percent) {
    return Math.min((100 - percent) / 100, 0.8); // Increased max opacity
  }

  static getDuration(percent) {
    const maxSpeed = game.settings.get("animatedanxiety", "maxSpeed");
    const minDuration = maxSpeed;
    const maxDuration = maxSpeed * 4;
    return (
      Math.max(
        maxDuration - ((maxDuration - minDuration) * (100 - percent)) / 100,
        minDuration
      ) + "s"
    );
  }

  static checkPoisonedStatus(actor) {
    if (!actor?.effects) {
      console.log("AnimatedAnxiety | No effects found on actor");
      return false;
    }

    console.log(
      "AnimatedAnxiety | Checking effects:",
      actor.effects.toObject()
    );

    // Check for the poisoned condition in different possible formats
    const isPoisoned = actor.effects.some((effect) => {
      const name = effect.name?.toLowerCase() || "";
      const statusId = effect.flags?.core?.statusId || "";
      const isActive = !effect.disabled;

      console.log("AnimatedAnxiety | Checking effect:", {
        name,
        statusId,
        isActive,
      });

      return (
        isActive &&
        (name === "poisoned" ||
          statusId === "poisoned" ||
          name.includes("poisoned"))
      );
    });

    console.log("AnimatedAnxiety | Poisoned status:", isPoisoned);
    return isPoisoned;
  }

  static checkBleedingStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return !e.disabled && name.includes("bleeding");
    });
  }

  static checkBlindedStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return (
        !e.disabled && (name.includes("blind") || name.includes("blinded"))
      );
    });
  }

  static checkCursedStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return (
        !e.disabled &&
        (name.includes("curse") ||
          name.includes("cursed") ||
          name.includes("hex"))
      );
    });
  }

  static checkCharmedStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return (
        !e.disabled && (name.includes("charm") || name.includes("charmed"))
      );
    });
  }

  static checkConcentratingStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return !e.disabled && name.includes("concentrating");
    });
  }

  static checkDeafenedStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return (
        !e.disabled && (name.includes("deaf") || name.includes("deafened"))
      );
    });
  }

  static checkDiseasedStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return (
        !e.disabled &&
        (name.includes("disease") ||
          name.includes("diseased") ||
          name.includes("sickness"))
      );
    });
  }

  static checkFrightenedStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return (
        !e.disabled &&
        (name.includes("frightened") ||
          name.includes("afraid") ||
          name.includes("fear"))
      );
    });
  }

  static checkGrappledStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return (
        !e.disabled && (name.includes("grappled") || name.includes("grabbed"))
      );
    });
  }

  static checkRestrainedStatus(actor) {
    if (!actor?.effects) return false;
    const effect = actor.effects.find((e) => {
      const name = e.name?.toLowerCase() || "";
      return !e.disabled && name.includes("restrained");
    });
    if (effect) {
      this.restrainedEffectImage = effect.icon || effect.img;
      return true;
    }
    this.restrainedEffectImage = null;
    return false;
  }

  static checkHidingStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return (
        !e.disabled &&
        (name.includes("hiding") ||
          name.includes("hidden") ||
          name.includes("stealth"))
      );
    });
  }

  static checkPetrifiedStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return (
        !e.disabled &&
        (name.includes("petrified") ||
          name.includes("stone") ||
          name.includes("statue"))
      );
    });
  }

  static checkParalyzedStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return (
        !e.disabled &&
        (name.includes("paralyzed") ||
          name.includes("paralysis") ||
          name.includes("stunned"))
      );
    });
  }

  static checkIncapacitatedStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return !e.disabled && name.includes("incapacitated");
    });
  }

  static checkDeadStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return !e.disabled && name.includes("dead");
    });
  }

  static checkBurrowingStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return !e.disabled && name.includes("burrow");
    });
  }

  static checkDodgeStatus(actor) {
    if (!actor?.effects) return false;
    const isDodging = actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      const isActive = !e.disabled;

      console.log("AnimatedAnxiety | Checking dodge effect:", {
        name,
        statusId,
        isActive,
        raw: e,
      });

      return (
        isActive &&
        (name === "dodging" || statusId === "dodge" || statusId === "dodging")
      );
    });
    console.log("AnimatedAnxiety | Dodge status:", isDodging);
    return isDodging;
  }

  static checkEtherealStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return (
        !e.disabled &&
        (name.includes("ethereal") || name.includes("etherealness"))
      );
    });
  }

  static checkExhaustionStatus(actor) {
    if (!actor?.effects) return 0;

    const exhaustionEffect = actor.effects.find((e) => {
      const name = e.name?.toLowerCase() || "";
      const isActive = !e.disabled;
      return isActive && name.includes("exhaustion");
    });

    if (!exhaustionEffect) return 0;

    // Extract level from effect name (e.g., "Exhaustion 3" -> 3)
    const level = parseInt(exhaustionEffect.name.match(/\d+/)?.[0] || "1");

    console.log("AnimatedAnxiety | Exhaustion level:", level);
    return level;
  }

  static checkFlyingStatus(actor) {
    if (!actor?.effects) {
        console.log("AnimatedAnxiety | No effects found for flying check");
        return false;
    }
    
    const isFlying = actor.effects.some((e) => {
        const name = e.name?.toLowerCase() || "";
        const statusId = e.flags?.core?.statusId || "";
        const isActive = !e.disabled;
        
        console.log("AnimatedAnxiety | Checking flying effect:", {
            name,
            statusId,
            isActive,
            raw: e
        });
        
        return isActive && (
            name.includes("fly") || 
            name.includes("flying") || 
            name.includes("levitate") ||
            statusId === "fly" ||
            statusId === "flying"
        );
    });
    
    console.log("AnimatedAnxiety | Flying status:", isFlying);
    return isFlying;
}

  static checkHoveringStatus(actor) {
    if (!actor?.effects) {
        console.log("AnimatedAnxiety | No effects found for hovering check");
        return false;
    }
    
    const isHovering = actor.effects.some((e) => {
        const name = e.name?.toLowerCase() || "";
        const statusId = e.flags?.core?.statusId || "";
        const isActive = !e.disabled;
        
        console.log("AnimatedAnxiety | Checking hovering effect:", {
            name,
            statusId,
            isActive,
            raw: e
        });
        
        return isActive && (
            name.includes("hover") || 
            name.includes("hovering") ||
            statusId === "hover" ||
            statusId === "hovering"
        );
    });
    
    console.log("AnimatedAnxiety | Hovering status:", isHovering);
    return isHovering;
}

  static checkInvisibleStatus(actor) {
    if (!actor?.effects) {
        console.log("AnimatedAnxiety | No effects found for invisible check");
        return false;
    }
    
    const isInvisible = actor.effects.some((e) => {
        const name = e.name?.toLowerCase() || "";
        const statusId = e.flags?.core?.statusId || "";
        const isActive = !e.disabled;
        
        console.log("AnimatedAnxiety | Checking invisible effect:", {
            name,
            statusId,
            isActive,
            raw: e
        });
        
        return isActive && (
            name.includes("invisible") || 
            name.includes("invisibility") ||
            statusId === "invisible"
        );
    });
    
    console.log("AnimatedAnxiety | Invisible status:", isInvisible);
    return isInvisible;
}

  static checkMarkedStatus(actor) {
    if (!actor?.effects) {
        console.log("AnimatedAnxiety | No effects found for marked check");
        return false;
    }
    
    const isMarked = actor.effects.some((e) => {
        const name = e.name?.toLowerCase() || "";
        const statusId = e.flags?.core?.statusId || "";
        const isActive = !e.disabled;
        
        console.log("AnimatedAnxiety | Checking marked effect:", {
            name,
            statusId,
            isActive,
            raw: e
        });
        
        return isActive && (
            name.includes("mark") || 
            name.includes("marked") ||
            statusId === "marked"
        );
    });
    
    console.log("AnimatedAnxiety | Marked status:", isMarked);
    return isMarked;
}

  static createCurseSymbols() {
    if (!this.curseInterval) {
      this.clearEffects();

      // Create cursed overlay
      const overlay = document.createElement("div");
      overlay.className = "cursed-overlay";
      document.getElementById("interface").appendChild(overlay);

      // Create floating curse symbols
      const symbols = ["X", "O", "+", "-", ""];

      this.curseInterval = setInterval(() => {
        const numSymbols = Math.random() < 0.3 ? 2 : 1;

        for (let i = 0; i < numSymbols; i++) {
          const symbol = document.createElement("div");
          symbol.className = "curse-symbol";
          symbol.textContent =
            symbols[Math.floor(Math.random() * symbols.length)];

          const orbitRadius = 45 + Math.random() * 25; // 45-70% from center
          const startAngle = Math.random() * Math.PI * 2;

          const startX = 50;
          const startY = 50;

          symbol.style.left = `${startX}%`;
          symbol.style.top = `${startY}%`;
          symbol.style.setProperty("--orbit-radius", `${orbitRadius}vh`);

          const rotations = 2 + Math.random();
          const endAngle = startAngle + Math.PI * 2 * rotations;
          const endRadius = orbitRadius * (0.6 + Math.random() * 0.2);

          const moveX = Math.cos(endAngle) * endRadius;
          const moveY = Math.sin(endAngle) * endRadius;

          symbol.style.setProperty("--curse-x", `${moveX}vh`);
          symbol.style.setProperty("--curse-y", `${moveY}vh`);
          symbol.style.setProperty("--curse-rotate", `${rotations * 720}deg`);

          const duration = 30 + Math.random() * 20;
          symbol.style.animation = `curse-float ${duration}s ease-in-out forwards`;

          document.getElementById("interface").appendChild(symbol);
          setTimeout(() => symbol.remove(), duration * 1000);
        }
      }, 750);
    }
  }

  static createHearts() {
    if (!this.heartInterval) {
      this.clearEffects();

      // Create cupid overlay
      const cupid = document.createElement("div");
      cupid.className = "cupid-overlay";
      document.getElementById("interface").appendChild(cupid);

      // Create floating hearts
      this.heartInterval = setInterval(() => {
        const heart = document.createElement("div");
        heart.className = "charm-heart";
        heart.textContent = "♥";

        const angle = Math.random() * Math.PI * 2;
        const startRadius = 60;
        const startX = 50 + Math.cos(angle) * startRadius;
        const startY = 50 + Math.sin(angle) * startRadius;

        heart.style.left = `${startX}%`;
        heart.style.top = `${startY}%`;

        const moveX = (Math.random() * 20 - 10 - (startX - 50)) * 1.2;
        const moveY = (Math.random() * 20 - 10 - (startY - 50)) * 1.2;

        heart.style.setProperty("--move-x", `${moveX}vh`);
        heart.style.setProperty("--move-y", `${moveY}vh`);

        const duration = 4 + Math.random() * 2;
        heart.style.animation = `heart-float ${duration}s ease-in-out forwards`;

        document.getElementById("interface").appendChild(heart);
        setTimeout(() => heart.remove(), duration * 1000);
      }, 300);
    }
  }

  static createBloodStreaks() {
    if (!this.bloodInterval) {
      this.clearEffects();

      // Create bleeding overlay
      const overlay = document.createElement("div");
      overlay.className = "bleeding-overlay";
      document.getElementById("interface").appendChild(overlay);

      // Keep the blood streaks effect for additional ambiance
      this.bloodInterval = setInterval(() => {
        const streak = document.createElement("div");
        streak.className = "blood-streak";
        streak.style.left = `${Math.random() * 100}%`;
        streak.style.opacity = (Math.random() * 0.4 + 0.4).toString();
        streak.style.width = `${Math.random() * 3 + 1}px`;
        const duration = Math.random() * 1.5 + 1.5;
        streak.style.animation = `blood-drip ${duration}s linear forwards`;
        document.getElementById("interface").appendChild(streak);
        setTimeout(() => streak.remove(), duration * 1000);
      }, 200);
    }
  }

  static createConcentrationParticles() {
    if (!this.particleInterval) {
      this.clearEffects();

      // Add concentration overlay
      const overlay = document.createElement("div");
      overlay.className = "concentration-overlay";
      document.getElementById("interface").appendChild(overlay);

      // Keep existing particle creation logic
      this.particleInterval = setInterval(() => {
        const particle = document.createElement("div");
        particle.className = "concentration-particle";

        const angle = Math.random() * Math.PI * 2;
        const startRadius = 50;
        const startX = 50 + Math.cos(angle) * startRadius;
        const startY = 50 + Math.sin(angle) * startRadius;

        particle.style.left = `${startX}%`;
        particle.style.top = `${startY}%`;

        const moveX = (Math.random() * 20 - 10 - (startX - 50)) * 0.5;
        const moveY = (Math.random() * 20 - 10 - (startY - 50)) * 0.5;

        particle.style.setProperty("--move-x", `${moveX}vh`);
        particle.style.setProperty("--move-y", `${moveY}vh`);

        document.getElementById("interface").appendChild(particle);
        setTimeout(() => particle.remove(), 3000);
      }, 1000); // Increased interval to reduce frequency
    }
  }

  static createDeafenedRipples() {
    if (!this.deafenedInterval) {
      this.clearEffects();

      // Create deafened overlay
      const overlay = document.createElement("div");
      overlay.className = "deafened-overlay";
      document.getElementById("interface").appendChild(overlay);

      // Keep the existing ripple effect for additional visual feedback
      this.deafenedInterval = setInterval(() => {
        const ripple = document.createElement("div");
        ripple.className = "deafened-ripple";
        document.getElementById("interface").appendChild(ripple);
        setTimeout(() => ripple.remove(), 3000);
      }, 1000);
    }
  }

  static createDiseaseParticles() {
    if (!this.diseaseInterval) {
      this.clearEffects();

      // Create rats overlay
      const rats = document.createElement("div");
      rats.className = "rats-overlay";
      document.getElementById("interface").appendChild(rats);

      // Create falling particles
      this.diseaseInterval = setInterval(() => {
        const particle = document.createElement("div");
        particle.className = "disease-particle";
        particle.style.left = `${Math.random() * 100}%`;
        particle.style.opacity = (Math.random() * 0.3 + 0.3).toString();
        const duration = Math.random() * 2 + 10;
        particle.style.animation = `disease-drip ${duration}s ease-in forwards`;
        document.getElementById("interface").appendChild(particle);
        setTimeout(() => particle.remove(), duration * 1000);
      }, 1000);
    }
  }

  static createFrightenedMarks() {
    if (!this.frightenedInterval) {
      this.clearEffects();

      // Create frightened overlay
      const overlay = document.createElement("div");
      overlay.className = "frightened-overlay";
      document.getElementById("interface").appendChild(overlay);

      // Create frightened marks
      this.frightenedInterval = setInterval(() => {
        // Create two marks - one from top, one from bottom
        ["top", "bottom"].forEach((direction) => {
          const mark = document.createElement("div");
          mark.className = "frightened-mark";
          mark.classList.add(`frightened-mark-${direction}`);
          mark.textContent = "!";

          // Random horizontal position
          mark.style.left = `${Math.random() * 90 + 5}%`;

          // Random sizes for variety
          const size = Math.random() * 20 + 30;
          mark.style.fontSize = `${size}px`;

          // Random animation duration
          const duration = Math.random() * 1 + 2;
          mark.style.animation = `frightened-pop-${direction} ${duration}s ease-in-out forwards`;

          document.getElementById("interface").appendChild(mark);
          setTimeout(() => mark.remove(), duration * 1000);
        });
      }, 200);
    }
  }

  static createGrappledEffect() {
    if (!this.grappledInterval) {
      this.clearEffects();

      // Create vignette effect
      const vignette = document.createElement("div");
      vignette.className = "grappled-vignette";
      document.getElementById("interface").appendChild(vignette);

      // Create hands overlay
      const overlay = document.createElement("div");
      overlay.className = "grappled-overlay";

      // Start both animations together but with a delay on the idle
      // Use animation-fill-mode: forwards on both to prevent jumps
      overlay.style.animation = `
        grapple-rise 0.8s ease-out forwards,
        grapple-idle 4s ease-in-out infinite 0.8s
      `;

      document.getElementById("interface").appendChild(overlay);

      // Store reference to remove later and ensure cleanup
      this.grappledInterval = setInterval(() => {
        if (!document.querySelector(".grappled-effect")) {
          this.clearEffects();
          clearInterval(this.grappledInterval);
          this.grappledInterval = null;
        }
      }, 1000);
    }
  }

  static createHidingEffect() {
    if (!this.hidingInterval) {
      this.clearEffects();

      // Create bushes overlay (removed vignette)
      const overlay = document.createElement("div");
      overlay.className = "hiding-overlay";

      // Start rise animation, then switch to subtle jiggle
      overlay.style.animation = `
        hiding-rise 0.8s ease-out forwards,
        hiding-idle 3s ease-in-out infinite 0.8s
      `;

      document.getElementById("interface").appendChild(overlay);

      // Store reference to remove later
      this.hidingInterval = setInterval(() => {
        if (!document.querySelector(".hiding-effect")) {
          this.clearEffects();
          clearInterval(this.hidingInterval);
          this.hidingInterval = null;
        }
      }, 1000);
    }
  }

  static createPetrifiedEffect() {
    if (!this.petrifiedInterval) {
      this.clearEffects();

      const overlay = document.createElement("div");
      overlay.className = "petrified-overlay";

      // Rise animation followed by periodic shake
      overlay.style.animation = `
        petrify-rise 0.8s ease-out forwards,
        petrify-cycle 10s linear infinite 0.8s
      `;

      document.getElementById("interface").appendChild(overlay);

      // Store reference to remove later
      this.petrifiedInterval = setInterval(() => {
        if (!document.querySelector(".petrified-effect")) {
          this.clearEffects();
          clearInterval(this.petrifiedInterval);
          this.petrifiedInterval = null;
        }
      }, 1000);
    }
  }

  static createParalyzedEffect() {
    if (!this.paralyzedInterval) {
      this.clearEffects();

      const overlay = document.createElement("div");
      overlay.className = "paralyzed-overlay";
      document.getElementById("interface").appendChild(overlay);

      // Store reference to remove later
      this.paralyzedInterval = setInterval(() => {
        if (!document.querySelector(".paralyzed-effect")) {
          this.clearEffects();
          clearInterval(this.paralyzedInterval);
          this.paralyzedInterval = null;
        }
      }, 1000);
    }
  }

  static createRestrainedEffect() {
    if (!this.restrainedInterval) {
      this.clearEffects();

      const corners = [
        { position: "bottom-left", x: "0%", y: "86%", rotate: "0deg" },
        { position: "bottom-right", x: "-14%", y: "0%", rotate: "90deg" }, //good
        { position: "top-right", x: "77%", y: "14%", rotate: "180deg" }, //good
        { position: "top-left", x: "90%", y: "100%", rotate: "270deg" }, //good
      ];

      corners.forEach((corner) => {
        const web = document.createElement("div");
        web.className = "restrained-web";
        web.style.position = "fixed";
        web.style.left = corner.x;
        web.style.top = corner.y;

        // Set the transform origin to the corner the web is attached to
        switch (corner.position) {
          case "bottom-left":
            web.style.transformOrigin = "left bottom";
            break;
          case "bottom-right":
            web.style.transformOrigin = "right bottom";
            break;
          case "top-right":
            web.style.transformOrigin = "right top";
            break;
          case "top-left":
            web.style.transformOrigin = "left top";
            break;
        }

        web.style.setProperty("--initial-rotation", corner.rotate);
        document.getElementById("interface").appendChild(web);

        // Add rise and sway animations
        web.style.animation = `web-rise 0.8s ease-out forwards, web-sway 4s ease-in-out infinite 0.8s`;
      });

      // Store reference to remove later
      this.restrainedInterval = setInterval(() => {
        if (!document.querySelector(".restrained-effect")) {
          this.clearEffects();
          clearInterval(this.restrainedInterval);
          this.restrainedInterval = null;
        }
      }, 1000);
    }
  }

  static createIncapacitatedEffect() {
    if (!this.incapacitatedInterval) {
      this.clearEffects();

      // Create incapacitated overlay
      const overlay = document.createElement("div");
      overlay.className = "incapacitated-overlay";
      document.getElementById("interface").appendChild(overlay); // Changed from document.body

      // Store reference to remove later
      this.incapacitatedInterval = setInterval(() => {
        if (!document.querySelector(".incapacitated-effect")) {
          this.clearEffects();
          clearInterval(this.incapacitatedInterval);
          this.incapacitatedInterval = null;
        }
      }, 1000);
    }
  }

  static createDeadEffect() {
    if (!this.deadInterval) {
      this.clearEffects();

      const overlay = document.createElement("div");
      overlay.className = "dead-overlay";
      document.getElementById("interface").appendChild(overlay);

      // Store reference to remove later
      this.deadInterval = setInterval(() => {
        if (!document.querySelector(".dead-effect")) {
          this.clearEffects();
          clearInterval(this.deadInterval);
          this.deadInterval = null;
        }
      }, 1000);
    }
  }

  static createBlindedEffect() {
    if (!this.blindedInterval) {
      this.clearEffects();

      const overlay = document.createElement("div");
      overlay.className = "blinded-overlay";
      document.getElementById("interface").appendChild(overlay);

      this.blindedInterval = setInterval(() => {
        if (!document.querySelector(".blinded-effect")) {
          this.clearEffects();
          clearInterval(this.blindedInterval);
          this.blindedInterval = null;
        }
      }, 1000);
    }
  }

  static createBurrowingEffect() {
    if (!this.burrowingInterval) {
      this.clearEffects();

      const overlay = document.createElement("div");
      overlay.className = "burrowing-overlay";
      document.getElementById("interface").appendChild(overlay);

      this.burrowingInterval = setInterval(() => {
        if (!document.querySelector(".burrowing-effect")) {
          this.clearEffects();
          clearInterval(this.burrowingInterval);
          this.burrowingInterval = null;
        }
      }, 1000);
    }
  }

  static createDodgeEffect() {
    if (!this.dodgeInterval) {
      this.clearEffects();

      // Bottom overlay
      const overlay = document.createElement("div");
      overlay.className = "dodge-overlay";
      overlay.style.animation = "dodge-rise 0.8s ease-out forwards";
      document.getElementById("interface").appendChild(overlay);

      // Top overlay (trapeze)
      const trapeze = document.createElement("div");
      trapeze.className = "trapeze-overlay";
      document.getElementById("interface").appendChild(trapeze);

      this.dodgeInterval = setInterval(() => {
        if (!document.querySelector(".dodge-effect")) {
          this.clearEffects();
          clearInterval(this.dodgeInterval);
          this.dodgeInterval = null;
        }
      }, 1000);
    }
  }

  static createEtherealEffect() {
    if (!this.etherealInterval) {
      this.clearEffects();

      const overlay = document.createElement("div");
      overlay.className = "ethereal-overlay";
      document.getElementById("interface").appendChild(overlay);

      this.etherealInterval = setInterval(() => {
        if (!document.querySelector(".ethereal-effect")) {
          this.clearEffects();
          clearInterval(this.etherealInterval);
          this.etherealInterval = null;
        }
      }, 1000);
    }
  }

  static createExhaustionEffect() {
    if (!this.exhaustionInterval) {
      this.clearEffects();

      // Create the bottom overlay
      const overlay = document.createElement("div");
      overlay.className = "exhaustion-overlay";
      document.getElementById("interface").appendChild(overlay);

      // Get exhaustion level (1-6)
      const level = this.checkExhaustionStatus(game.user?.character);

      // Calculate blur values based on level
      const blurAmount = Math.min(level * 0.5, 3); // 1.5px to 8px blur
      const clearRadius = Math.max(90 - level * 12, 30); // 78% to 30% clear center
      const opacity = Math.min(0.1 + level * 0.1, 0.6); // 0.2 to 0.6 opacity
      const duration = Math.max(7 - level * 1.0, 1); // 6s to 1s pulse

      // Apply the blur effect
      const appElement = document.getElementById("interface");
      appElement.style.setProperty("--exhaustion-blur", `${blurAmount}px`);
      appElement.style.setProperty("--exhaustion-clear", `${clearRadius}%`);
      appElement.style.setProperty("--exhaustion-opacity", opacity);
      appElement.style.setProperty("--exhaustion-duration", `${duration}s`);

      this.exhaustionInterval = setInterval(() => {
        if (!document.querySelector(".exhaustion-effect")) {
          this.clearEffects();
          clearInterval(this.exhaustionInterval);
          this.exhaustionInterval = null;
        }
      }, 1000);
    }
  }

  static createFlyingEffect() {
    if (!this.flyingInterval) {
        this.clearEffects();
        
        console.log("AnimatedAnxiety | Creating flying effect");
        
        const overlay = document.createElement("div");
        overlay.className = "flying-overlay";
        
        // Use absolute path and log any errors
        const imagePath = "modules/animatedanxiety/assets/feathers.png";
        overlay.style.backgroundImage = `url('${imagePath}')`;
        
        console.log("AnimatedAnxiety | Setting background image:", imagePath);
        
        // Start rise animation, then switch to subtle float
        overlay.style.animation = `
            flying-rise 0.8s ease-out forwards,
            flying-float 4s ease-in-out infinite 0.8s
        `;
        
        document.getElementById("interface").appendChild(overlay);
        
        // Verify the overlay was created and styled correctly
        console.log("AnimatedAnxiety | Flying overlay created:", overlay);
        
        // Store reference to remove later
        this.flyingInterval = setInterval(() => {
            if (!document.querySelector(".flying-effect")) {
                console.log("AnimatedAnxiety | Cleaning up flying effect");
                this.clearEffects();
                clearInterval(this.flyingInterval);
                this.flyingInterval = null;
            }
        }, 1000);
    }
}

  static createHoveringEffect() {
    if (!this.hoveringInterval) {
        this.clearEffects();
        
        console.log("AnimatedAnxiety | Creating hovering effect");
        
        const overlay = document.createElement("div");
        overlay.className = "hovering-overlay";
        
        const imagePath = "modules/animatedanxiety/assets/hovering.png";
        overlay.style.backgroundImage = `url('${imagePath}')`;
        
        console.log("AnimatedAnxiety | Setting hovering background image:", imagePath);
        
        overlay.style.animation = `
            hovering-rise 0.8s ease-out forwards,
            hovering-float 4s ease-in-out infinite 0.8s
        `;
        
        document.getElementById("interface").appendChild(overlay);
        
        console.log("AnimatedAnxiety | Hovering overlay created:", overlay);
        
        this.hoveringInterval = setInterval(() => {
            if (!document.querySelector(".hovering-effect")) {
                console.log("AnimatedAnxiety | Cleaning up hovering effect");
                this.clearEffects();
                clearInterval(this.hoveringInterval);
                this.hoveringInterval = null;
            }
        }, 1000);
    }
}

  static createInvisibleEffect() {
    if (!this.invisibleInterval) {
        this.clearEffects();
        
        console.log("AnimatedAnxiety | Creating invisible effect");
        
        const overlay = document.createElement("div");
        overlay.className = "invisible-overlay";
        
        const imagePath = "modules/animatedanxiety/assets/invisible.png";
        overlay.style.backgroundImage = `url('${imagePath}')`;
        
        console.log("AnimatedAnxiety | Setting invisible background image:", imagePath);
        
        // Apply animations directly to ensure they're being set
        overlay.style.animation = "invisible-rise 0.8s ease-out forwards";
        setTimeout(() => {
            overlay.style.animation = "invisible-pulse 4s ease-in-out infinite";
        }, 800);
        
        document.getElementById("interface").appendChild(overlay);
        
        console.log("AnimatedAnxiety | Invisible overlay created:", overlay);
        console.log("AnimatedAnxiety | Overlay animations:", overlay.style.animation);
        
        this.invisibleInterval = setInterval(() => {
            if (!document.querySelector(".invisible-effect")) {
                console.log("AnimatedAnxiety | Cleaning up invisible effect");
                this.clearEffects();
                clearInterval(this.invisibleInterval);
                this.invisibleInterval = null;
            }
        }, 1000);
    }
}

  static createMarkedEffect() {
    if (!this.markedInterval) {
        this.clearEffects();
        
        console.log("AnimatedAnxiety | Creating marked effect");
        
        const overlay = document.createElement("div");
        overlay.className = "marked-overlay";
        
        const imagePath = "modules/animatedanxiety/assets/marked.png";
        overlay.style.backgroundImage = `url('${imagePath}')`;
        
        console.log("AnimatedAnxiety | Setting marked background image:", imagePath);
        
        overlay.style.animation = "marked-rise 0.8s ease-out forwards";
        
        document.getElementById("interface").appendChild(overlay);
        
        console.log("AnimatedAnxiety | Marked overlay created:", overlay);
        
        this.markedInterval = setInterval(() => {
            if (!document.querySelector(".marked-effect")) {
                console.log("AnimatedAnxiety | Cleaning up marked effect");
                this.clearEffects();
                clearInterval(this.markedInterval);
                this.markedInterval = null;
            }
        }, 1000);
    }
}

}

Hooks.once("init", () => {
  CONFIG.debug.hooks = true;
  AnimatedAnxiety.init();
});
