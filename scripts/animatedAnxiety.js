class AnimatedAnxiety {
  static init() {
    console.log("AnimatedAnxiety | Initializing");
    game.animatedAnxiety = this;
    this.registerSettings();
    this.setupHooks();
  }

  static registerSettings() {
    game.settings.register("animatedanxiety", "enabled", {
      name: "Turn On/Off Anxiety Effects",
      hint: "Toggle the anxiety effects on/off",
      scope: "client",
      config: true,
      type: Boolean,
      default: true,
      onChange: () => this.updateAnxietyEffect(game.user?.character),
    });

    game.settings.register("animatedanxiety", `enable_anxiety`, {
      name: `Enable Low Health Effect`,
      hint: `Toggle the low health effect animation`,
      scope: "client",
      config: true,
      type: Boolean,
      default: true,
      onChange: () => this.updateAnxietyEffect(game.user?.character),
    });

    game.settings.register("animatedanxiety", "anxietyThreshold", {
      name: "Anxiety Effect Threshold",
      hint: "Health percentage at which the anxiety effect begins (1-100)",
      scope: "client",
      config: true,
      type: Number,
      range: {
        min: 1,
        max: 100,
        step: 1,
      },
      default: 50,
      onChange: () => this.updateAnxietyEffect(game.user?.character),
    });

    game.settings.register("animatedanxiety", "showVeins", {
      name: "Show Low Health Veins Overlay",
      hint: "Show the veins overlay effect when health is critical (below 20%)",
      scope: "client",
      config: true,
      type: Boolean,
      default: true,
      onChange: () => this.updateAnxietyEffect(game.user?.character),
    });

    game.settings.register("animatedanxiety", "veinsThreshold", {
      name: "Critical Health Veins Threshold",
      hint: "Health percentage at which the veins overlay appears (1-100)",
      scope: "client",
      config: true,
      type: Number,
      range: {
        min: 1,
        max: 100,
        step: 1,
      },
      default: 20,
      onChange: () => this.updateAnxietyEffect(game.user?.character),
    });

    // Add individual status toggles
    const statusEffects = {
      // anxiety: "Low Health",
      unconscious: "Unconscious",
      poisoned: "Poisoned",
      bleeding: "Bleeding",
      blinded: "Blinded",
      cursed: "Cursed",
      charmed: "Charmed",
      concentrating: "Concentrating",
      deafened: "Deafened",
      diseased: "Diseased",
      frightened: "Frightened",
      grappled: "Grappled",
      hiding: "Hiding",
      petrified: "Petrified",
      paralyzed: "Paralyzed",
      restrained: "Restrained",
      incapacitated: "Incapacitated",
      dead: "Dead",
      burrowing: "Burrowing",
      dodging: "Dodging",
      ethereal: "Ethereal",
      exhausted: "Exhausted",
      flying: "Flying",
      hovering: "Hovering",
      invisible: "Invisible",
      marked: "Marked",
      prone: "Prone",
      silenced: "Silenced",
      sleeping: "Sleeping",
      stable: "Stable",
      stunned: "Stunned",
      surprised: "Surprised",
      transformed: "Transformed",
    };

    // Register a setting for each status effect
    for (const [key, label] of Object.entries(statusEffects)) {
      game.settings.register("animatedanxiety", `enable_${key}`, {
        name: `Enable ${label} Effect`,
        hint: `Toggle the ${label.toLowerCase()} effect animation`,
        scope: "client",
        config: true,
        type: Boolean,
        default: true,
        onChange: () => this.updateAnxietyEffect(game.user?.character),
      });
    }

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

    // Add new setting for veins overlay
    // game.settings.register("animatedanxiety", "showVeins", {
    //   name: "Show Veins Overlay",
    //   hint: "Show the veins overlay effect when health is critical (below 20%)",
    //   scope: "client",
    //   config: true,
    //   type: Boolean,
    //   default: true,
    //   onChange: () => this.updateAnxietyEffect(game.user?.character),
    // });
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
      const isProne = this.checkProneStatus(actor); // Add this line
      const isSilenced = this.checkSilencedStatus(actor);
      const isSleeping = this.checkSleepingStatus(actor); // Add this line
      const isStable = this.checkStableStatus(actor);
      const isStunned = this.checkStunnedStatus(actor); // Add this line
      const isSurprised = this.checkSurprisedStatus(actor); // Add this line
      const isTransformed = this.checkTransformedStatus(actor); // Add this line

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
        "marked-effect", // Add this line
        "prone-effect", // Add this line
        "silenced-effect",
        "sleeping-effect", // Add this line
        "stable-effect", // Add this line
        "stunned-effect", // Add this line
        "surprised-effect", // Add this line
        "transformed-effect", // Add this line
        "deafened-fade", // Add this line
        "diseased-fade", // Add this line
        "frightened-fade", // Add this line
        "grappled-fade", // Add this line
        "hiding-fade", // Add this line
        "petrified-fade", // Add this line
        "paralyzed-fade", // Add this line
        "restrained-fade", // Add this line
        "incapacitated-fade", // Add this line
        "burrowing-fade", // Add this line
        "dodge-fade", // Add this line
        "ethereal-fade", // Add this line
        "exhaustion-fade", // Add this line
        "prone-fade", // Add this line
        "marked-fade", // Add this line
        "invisible-fade", // Add this line
        "hovering-fade", // Add this line
        "flying-fade", // Add this line
        "silenced-fade", // Add this line
        "sleeping-fade", // Add this line
        "stable-fade", // Add this line
        "stunned-fade", // Add this line
        "surprised-fade", // Add this line
        "transformed-fade", // Add this line
        "charmed-fade", // Add this line
        "bleeding-fade", // Add this line
        "dead-fade", // Add this line
        "charmed-effect",
        "bleeding-effect",
        "dead-effect",
        "cursed-effect",
        "cursed-fade" // Add this line
      );

      // Handle static effects
      if (
        healthPercent < 50 &&
        game.settings.get("animatedanxiety", "enable_anxiety")
      ) {
        appElement.classList.add("anxiety-effect");
      }
      if (isBlinded && game.settings.get("animatedanxiety", "enable_blinded")) {
        appElement.classList.add("blinded-effect");
        this.createBlindedEffect(); // Add this line
      }
      if (
        isDeafened &&
        game.settings.get("animatedanxiety", "enable_deafened")
      ) {
        // Add this block
        appElement.classList.add("deafened-effect");
        this.createDeafenedRipples();
      }
      // Add unconscious handler here as a static effect
      if (
        isUnconscious &&
        game.settings.get("animatedanxiety", "enable_unconscious")
      ) {
        appElement.classList.add("unconscious-effect");
        this.createBubbles("black-inward");
      }

      // Handle animated effects in order of priority (moving prone to end)
      if (isDead && game.settings.get("animatedanxiety", "enable_dead")) {
        appElement.classList.add("dead-effect");
        this.createDeadEffect();
      } else if (
        isGrappled &&
        game.settings.get("animatedanxiety", "enable_grappled")
      ) {
        appElement.classList.add("grappled-effect");
        this.createGrappledEffect();
      } else if (
        isRestrained &&
        game.settings.get("animatedanxiety", "enable_restrained")
      ) {
        appElement.classList.add("restrained-effect");
        this.createRestrainedEffect();
      } else if (
        isPetrified &&
        game.settings.get("animatedanxiety", "enable_petrified")
      ) {
        appElement.classList.add("petrified-effect");
        this.createPetrifiedEffect();
      } else if (
        isParalyzed &&
        game.settings.get("animatedanxiety", "enable_paralyzed")
      ) {
        appElement.classList.add("paralyzed-effect");
        this.createParalyzedEffect();
      } else if (
        isStunned &&
        game.settings.get("animatedanxiety", "enable_stunned")
      ) {
        appElement.classList.add("stunned-effect");
        this.createStunnedEffect();
      } else if (
        isHiding &&
        game.settings.get("animatedanxiety", "enable_hiding")
      ) {
        appElement.classList.add("hiding-effect");
        this.createHidingEffect();
      } else if (
        isPoisoned &&
        game.settings.get("animatedanxiety", "enable_poisoned")
      ) {
        appElement.classList.add("poison-effect");
        this.createBubbles("sway");
      } else if (
        isDiseased &&
        game.settings.get("animatedanxiety", "enable_diseased")
      ) {
        appElement.classList.add("diseased-effect");
        this.createDiseaseParticles();
      } else if (
        isFrightened &&
        game.settings.get("animatedanxiety", "enable_frightened")
      ) {
        appElement.classList.add("frightened-effect");
        this.createFrightenedMarks();
      } else if (
        isCursed &&
        game.settings.get("animatedanxiety", "enable_cursed")
      ) {
        this.createCurseSymbols();
      } else if (
        isCharmed &&
        game.settings.get("animatedanxiety", "enable_charmed")
      ) {
        this.createHearts();
      } else if (
        isBleeding &&
        game.settings.get("animatedanxiety", "enable_bleeding")
      ) {
        this.createBloodStreaks();
      } else if (
        isConcentrating &&
        game.settings.get("animatedanxiety", "enable_concentrating")
      ) {
        appElement.classList.add("concentration-effect");
        this.createConcentrationParticles();
      } else if (
        isDodging &&
        game.settings.get("animatedanxiety", "enable_dodging")
      ) {
        appElement.classList.add("dodge-effect");
        this.createDodgeEffect();
      } else if (
        isIncapacitated &&
        game.settings.get("animatedanxiety", "enable_incapacitated")
      ) {
        appElement.classList.add("incapacitated-effect");
        this.createIncapacitatedEffect();
      } else if (
        isBurrowing &&
        game.settings.get("animatedanxiety", "enable_burrowing")
      ) {
        appElement.classList.add("burrowing-effect");
        this.createBurrowingEffect();
      } else if (
        isEthereal &&
        game.settings.get("animatedanxiety", "enable_ethereal")
      ) {
        appElement.classList.add("ethereal-effect");
        this.createEtherealEffect();
      } else if (
        isExhausted &&
        game.settings.get("animatedanxiety", "enable_exhausted")
      ) {
        appElement.classList.add("exhaustion-effect");
        this.createExhaustionEffect();
      } else if (
        isMarked &&
        game.settings.get("animatedanxiety", "enable_marked")
      ) {
        appElement.classList.add("marked-effect");
        this.createMarkedEffect();
      } else if (
        isInvisible &&
        game.settings.get("animatedanxiety", "enable_invisible")
      ) {
        appElement.classList.add("invisible-effect");
        this.createInvisibleEffect();
      } else if (
        isHovering &&
        game.settings.get("animatedanxiety", "enable_hovering")
      ) {
        appElement.classList.add("hovering-effect");
        this.createHoveringEffect();
      } else if (
        isFlying &&
        game.settings.get("animatedanxiety", "enable_flying")
      ) {
        appElement.classList.add("flying-effect");
        this.createFlyingEffect();
      } else if (
        isSilenced &&
        game.settings.get("animatedanxiety", "enable_silenced")
      ) {
        appElement.classList.add("silenced-effect");
        this.createSilencedEffect();
      } else if (
        isSleeping &&
        game.settings.get("animatedanxiety", "enable_sleeping")
      ) {
        appElement.classList.add("sleeping-effect");
        this.createSleepingEffect();
      } else if (
        isStable &&
        game.settings.get("animatedanxiety", "enable_stable")
      ) {
        appElement.classList.add("stable-effect");
        this.createStableEffect();
      } else if (
        isSurprised &&
        game.settings.get("animatedanxiety", "enable_surprised")
      ) {
        appElement.classList.add("surprised-effect");
        this.createSurprisedEffect();
      } else if (
        isTransformed &&
        game.settings.get("animatedanxiety", "enable_transformed")
      ) {
        appElement.classList.add("transformed-effect");
        this.createTransformedEffect();
      } else if (
        isProne &&
        !isUnconscious &&
        game.settings.get("animatedanxiety", "enable_prone")
      ) {
        // Moved to the end of the chain
        appElement.classList.add("prone-effect");
        this.createProneEffect();
      }

      // Add color fade for statuses without one
      if (
        isDeafened &&
        game.settings.get("animatedanxiety", "enable_deafened")
      ) {
        appElement.classList.add("deafened-fade");
      }
      if (
        isDiseased &&
        game.settings.get("animatedanxiety", "enable_diseased")
      ) {
        appElement.classList.add("diseased-fade");
      }
      if (
        isFrightened &&
        game.settings.get("animatedanxiety", "enable_frightened")
      ) {
        appElement.classList.add("frightened-fade");
      }
      if (
        isGrappled &&
        game.settings.get("animatedanxiety", "enable_grappled")
      ) {
        appElement.classList.add("grappled-fade");
      }
      if (isHiding && game.settings.get("animatedanxiety", "enable_hiding")) {
        appElement.classList.add("hiding-fade");
      }
      if (
        isPetrified &&
        game.settings.get("animatedanxiety", "enable_petrified")
      ) {
        appElement.classList.add("petrified-fade");
      }
      if (
        isParalyzed &&
        game.settings.get("animatedanxiety", "enable_paralyzed")
      ) {
        appElement.classList.add("paralyzed-fade");
      }
      if (
        isRestrained &&
        game.settings.get("animatedanxiety", "enable_restrained")
      ) {
        appElement.classList.add("restrained-fade");
      }
      if (
        isIncapacitated &&
        game.settings.get("animatedanxiety", "enable_incapacitated")
      ) {
        appElement.classList.add("incapacitated-fade");
      }
      if (
        isBurrowing &&
        game.settings.get("animatedanxiety", "enable_burrowing")
      ) {
        appElement.classList.add("burrowing-fade");
      }
      if (isDodging && game.settings.get("animatedanxiety", "enable_dodging")) {
        appElement.classList.add("dodge-fade");
      }
      if (
        isEthereal &&
        game.settings.get("animatedanxiety", "enable_ethereal")
      ) {
        appElement.classList.add("ethereal-fade");
      }
      if (
        isExhausted &&
        game.settings.get("animatedanxiety", "enable_exhausted")
      ) {
        appElement.classList.add("exhaustion-fade");
      }
      if (
        isProne &&
        !isUnconscious &&
        game.settings.get("animatedanxiety", "enable_prone")
      ) {
        appElement.classList.add("prone-fade");
      }
      if (isMarked && game.settings.get("animatedanxiety", "enable_marked")) {
        appElement.classList.add("marked-fade");
      }
      if (
        isInvisible &&
        game.settings.get("animatedanxiety", "enable_invisible")
      ) {
        appElement.classList.add("invisible-fade");
      }
      if (
        isHovering &&
        game.settings.get("animatedanxiety", "enable_hovering")
      ) {
        appElement.classList.add("hovering-fade");
      }
      if (isFlying && game.settings.get("animatedanxiety", "enable_flying")) {
        appElement.classList.add("flying-fade");
      }
      if (
        isSilenced &&
        game.settings.get("animatedanxiety", "enable_silenced")
      ) {
        appElement.classList.add("silenced-fade");
      }
      if (
        isSleeping &&
        game.settings.get("animatedanxiety", "enable_sleeping")
      ) {
        appElement.classList.add("sleeping-fade");
      }
      if (isStable && game.settings.get("animatedanxiety", "enable_stable")) {
        appElement.classList.add("stable-fade");
      }
      if (isStunned && game.settings.get("animatedanxiety", "enable_stunned")) {
        appElement.classList.add("stunned-fade");
      }
      if (
        isSurprised &&
        game.settings.get("animatedanxiety", "enable_surprised")
      ) {
        appElement.classList.add("surprised-fade");
      }
      if (
        isTransformed &&
        game.settings.get("animatedanxiety", "enable_transformed")
      ) {
        appElement.classList.add("transformed-fade");
      }
      if (isCharmed && game.settings.get("animatedanxiety", "enable_charmed")) {
        appElement.classList.add("charmed-fade");
      }
      if (
        isBleeding &&
        game.settings.get("animatedanxiety", "enable_bleeding")
      ) {
        appElement.classList.add("bleeding-fade");
      }
      if (isDead && game.settings.get("animatedanxiety", "enable_dead")) {
        appElement.classList.add("dead-fade");
      }
      if (isCursed && game.settings.get("animatedanxiety", "enable_cursed")) {
        appElement.classList.add("cursed-fade");
      }

      // Remove existing health effects
      document.querySelectorAll(".veins-overlay").forEach((el) => el.remove());

      // Get thresholds from settings
      const anxietyThreshold = game.settings.get(
        "animatedanxiety",
        "anxietyThreshold"
      );
      const veinsThreshold = game.settings.get(
        "animatedanxiety",
        "veinsThreshold"
      );

      // Set anxiety effect intensity based on health
      if (
        healthPercent < anxietyThreshold &&
        game.settings.get("animatedanxiety", "enable_anxiety")
      ) {
        const opacity = (anxietyThreshold - healthPercent) / 100;
        const duration = Math.max(
          5 - ((anxietyThreshold - healthPercent) / anxietyThreshold) * 2,
          0.8
        );
        const blur = Math.min(400, (anxietyThreshold - healthPercent) * 8);

        appElement.classList.add("anxiety-effect");
        appElement.style.setProperty("--anxiety-opacity", opacity);
        appElement.style.setProperty("--anxiety-duration", `${duration}s`);
        appElement.style.setProperty("--anxiety-blur", `${blur}px`);

        // Only show veins if the setting is enabled and health is below veins threshold
        if (
          healthPercent < veinsThreshold &&
          game.settings.get("animatedanxiety", "showVeins")
        ) {
          const veinsOverlay = document.createElement("div");
          veinsOverlay.className = "veins-overlay";
          appElement.appendChild(veinsOverlay);
        }
      } else {
        // Remove anxiety effect if health is above threshold or effect is disabled
        appElement.classList.remove("anxiety-effect");
        appElement.style.removeProperty("--anxiety-opacity");
        appElement.style.removeProperty("--anxiety-duration");
        appElement.style.removeProperty("--anxiety-blur");
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
      clearInterval(this.burrowingInterval);
      this.burrowingInterval = null;
    }
    if (this.dodgeInterval) {
      clearInterval(this.dodgeInterval);
      this.dodgeInterval = null;
    }
    if (this.etherealInterval) {
      clearInterval(this.etherealInterval);
      this.etherealInterval = null;
    }
    if (this.etherealCleanupInterval) {
      clearInterval(this.etherealCleanupInterval);
      this.etherealCleanupInterval = null;
    }
    if (this.exhaustionInterval) {
      clearInterval(this.exhaustionInterval);
      this.exhaustionInterval = null;
    }
    if (this.flyingInterval) {
      clearInterval(this.flyingInterval);
      this.flyingInterval = null;
    }
    if (this.hoveringInterval) {
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
    if (this.proneInterval) {
      clearInterval(this.proneInterval);
      this.proneInterval = null;
    }
    if (this.silencedInterval) {
      clearInterval(this.silencedInterval);
      this.silencedInterval = null;
    }
    if (this.sleepingInterval) {
      clearInterval(this.sleepingInterval);
      this.sleepingInterval = null;
    }
    if (this.stableInterval) {
      clearInterval(this.stableInterval);
      this.stableInterval = null;
    }
    if (this.stunnedInterval) {
      clearInterval(this.stunnedInterval);
      this.stunnedInterval = null;
    }
    if (this.surprisedInterval) {
      clearInterval(this.surprisedInterval);
      this.surprisedInterval = null;
    }
    if (this.transformedInterval) {
      clearInterval(this.transformedInterval);
      this.transformedInterval = null;
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
    document
      .querySelectorAll(".restrained-overlay")
      .forEach((el) => el.remove()); // Add this line
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
    document
      .querySelectorAll(".invisible-overlay")
      .forEach((el) => el.remove());
    document.querySelectorAll(".marked-overlay").forEach((el) => el.remove());
    document.querySelectorAll(".prone-overlay").forEach((el) => el.remove());
    document.querySelectorAll(".silenced-overlay").forEach((el) => el.remove());
    document.querySelectorAll(".sleeping-overlay").forEach((el) => el.remove()); // Add this line
    document.querySelectorAll(".stable-overlay").forEach((el) => el.remove());
    document.querySelectorAll(".stunned-overlay").forEach((el) => el.remove()); // Add this line
    document
      .querySelectorAll(".surprised-overlay")
      .forEach((el) => el.remove()); // Add this line
    document
      .querySelectorAll(".transformed-overlay")
      .forEach((el) => el.remove()); // Add this line
    document
      .querySelectorAll(".unconscious-overlay")
      .forEach((el) => el.remove());
    document.querySelectorAll(".ethereal-swirl").forEach((el) => el.remove());
    document.querySelectorAll(".falling-feather").forEach((el) => el.remove()); // Add this line
  }

  // New check for unconscious
  static checkUnconsciousStatus(actor) {}

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

      // Add unconscious overlay if in black-inward mode
      if (mode === "black-inward") {
        const overlay = document.createElement("div");
        overlay.className = "unconscious-overlay";
        overlay.style.animation = "unconscious-rise 0.8s ease-out forwards";
        document.getElementById("interface").appendChild(overlay);
      }

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
    if (!actor?.effects) {
      console.log("AnimatedAnxiety | No effects found for petrified check");
      return false;
    }

    const isPetrified = actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      const isActive = !e.disabled;

      console.log("AnimatedAnxiety | Checking petrified effect:", {
        name,
        statusId,
        isActive,
        raw: e,
      });

      return (
        isActive &&
        (name === "petrified" ||
          statusId === "petrified" ||
          name.includes("petrify") ||
          name.includes("stone") ||
          name.includes("statue"))
      );
    });

    console.log("AnimatedAnxiety | Petrified status:", isPetrified);
    return isPetrified;
  }

  static checkParalyzedStatus(actor) {
    if (!actor?.effects) return false;
    return actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      return (
        !e.disabled &&
        (name.includes("paralyzed") || name.includes("paralysis"))
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
        raw: e,
      });

      return (
        isActive &&
        (name.includes("fly") ||
          name.includes("flying") ||
          name.includes("levitate") ||
          statusId === "fly" ||
          statusId === "flying")
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
        raw: e,
      });

      return (
        isActive &&
        (name.includes("hover") ||
          name.includes("hovering") ||
          statusId === "hover" ||
          statusId === "hovering")
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
        raw: e,
      });

      return (
        isActive &&
        (name.includes("invisible") ||
          name.includes("invisibility") ||
          statusId === "invisible")
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
        raw: e,
      });

      return (
        isActive &&
        (name.includes("mark") ||
          name.includes("marked") ||
          statusId === "marked")
      );
    });

    console.log("AnimatedAnxiety | Marked status:", isMarked);
    return isMarked;
  }

  static checkProneStatus(actor) {
    if (!actor?.effects) {
      console.log("AnimatedAnxiety | No effects found for prone check");
      return false;
    }

    const isProne = actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      const isActive = !e.disabled;

      console.log("AnimatedAnxiety | Checking prone effect:", {
        name,
        statusId,
        isActive,
        raw: e,
      });

      return isActive && (name.includes("prone") || statusId === "prone");
    });

    console.log("AnimatedAnxiety | Prone status:", isProne);
    return isProne;
  }

  static checkSilencedStatus(actor) {
    if (!actor?.effects) {
      console.log("AnimatedAnxiety | No effects found for silenced check");
      return false;
    }

    const isSilenced = actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      const isActive = !e.disabled;

      console.log("AnimatedAnxiety | Checking silenced effect:", {
        name,
        statusId,
        isActive,
        raw: e,
      });

      // Updated conditions to match the exact name 'Silenced'
      return (
        isActive &&
        (name === "silenced" ||
          statusId === "silenced" ||
          e.name === "Silenced") // Add exact match for 'Silenced'
      );
    });

    console.log("AnimatedAnxiety | Silenced status:", isSilenced);
    return isSilenced;
  }

  static checkSleepingStatus(actor) {
    if (!actor?.effects) {
      console.log("AnimatedAnxiety | No effects found for sleeping check");
      return false;
    }

    const isSleeping = actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      const isActive = !e.disabled;

      console.log("AnimatedAnxiety | Checking sleeping effect:", {
        name,
        statusId,
        isActive,
        raw: e,
      });

      return (
        isActive &&
        (name === "sleep" ||
          name === "sleeping" ||
          name.includes("sleep") ||
          statusId === "sleep" ||
          e.name === "Sleep")
      );
    });

    console.log("AnimatedAnxiety | Sleeping status:", isSleeping);
    return isSleeping;
  }

  static checkStableStatus(actor) {
    if (!actor?.effects) {
      console.log("AnimatedAnxiety | No effects found for stable check");
      return false;
    }

    const isStable = actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      const isActive = !e.disabled;

      console.log("AnimatedAnxiety | Checking stable effect:", {
        name,
        statusId,
        isActive,
        raw: e,
      });

      return (
        isActive &&
        (name === "stable" || statusId === "stable" || e.name === "Stable")
      );
    });

    console.log("AnimatedAnxiety | Stable status:", isStable);
    return isStable;
  }

  static checkStunnedStatus(actor) {
    if (!actor?.effects) {
      console.log("AnimatedAnxiety | No effects found for stunned check");
      return false;
    }

    const isStunned = actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      const isActive = !e.disabled;

      console.log("AnimatedAnxiety | Checking stunned effect:", {
        name,
        statusId,
        isActive,
        raw: e,
      });

      return (
        isActive &&
        (name === "stunned" || statusId === "stunned" || e.name === "Stunned")
      );
    });

    console.log("AnimatedAnxiety | Stunned status:", isStunned);
    return isStunned;
  }

  static checkSurprisedStatus(actor) {
    if (!actor?.effects) {
      console.log("AnimatedAnxiety | No effects found for surprised check");
      return false;
    }

    const isSurprised = actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      const isActive = !e.disabled;

      console.log("AnimatedAnxiety | Checking surprised effect:", {
        name,
        statusId,
        isActive,
        raw: e,
      });

      return (
        isActive &&
        (name === "surprised" ||
          statusId === "surprised" ||
          e.name === "Surprised")
      );
    });

    console.log("AnimatedAnxiety | Surprised status:", isSurprised);
    return isSurprised;
  }

  static checkTransformedStatus(actor) {
    if (!actor?.effects) {
      console.log("AnimatedAnxiety | No effects found for transformed check");
      return false;
    }

    const isTransformed = actor.effects.some((e) => {
      const name = e.name?.toLowerCase() || "";
      const statusId = e.flags?.core?.statusId || "";
      const isActive = !e.disabled;

      console.log("AnimatedAnxiety | Checking transformed effect:", {
        name,
        statusId,
        isActive,
        raw: e,
      });

      return (
        isActive &&
        (name === "transformed" ||
          name.includes("polymorph") ||
          name.includes("wild shape") ||
          statusId === "transformed")
      );
    });

    console.log("AnimatedAnxiety | Transformed status:", isTransformed);
    return isTransformed;
  }

  static createCurseSymbols() {
    if (!this.curseInterval) {
      this.clearEffects();

      // Create cursed overlay
      const overlay = document.createElement("div");
      overlay.className = "cursed-overlay";
      document.getElementById("interface").appendChild(overlay);

      // Array of available pentagram images
      const pentagrams = [
        "modules/animatedanxiety/assets/pentagram1.png",
        "modules/animatedanxiety/assets/pentagram2.png",
        "modules/animatedanxiety/assets/pentagram3.png",
        "modules/animatedanxiety/assets/pentagram4.png",
      ];

      // Function to create an occult symbol
      const createOccultSymbol = () => {
        const symbol = document.createElement("img");
        symbol.className = "curse-symbol";
        // Randomly select one of the pentagram images
        symbol.src = pentagrams[Math.floor(Math.random() * pentagrams.length)];
        symbol.style.border = "none";

        // Random position at the bottom
        symbol.style.left = `${Math.random() * 100}%`;
        symbol.style.bottom = "-10%";

        // Much wider size range: between 20px and 60px
        const size = Math.random() * 40 + 40;
        symbol.style.width = `${size}px`;
        symbol.style.height = `${size}px`;

        // Random float height between 15vh and 33vh (bottom third of screen)
        const floatHeight = Math.random() * 18 + 25;
        symbol.style.setProperty("--float-height", `${floatHeight}vh`);

        // Random duration between 4s and 7s
        const duration = Math.random() * 3 + 4;
        symbol.style.animation = `curse-float ${duration}s ease-in-out forwards`;

        document.getElementById("interface").appendChild(symbol);
        setTimeout(() => symbol.remove(), duration * 1000);
      };

      // Create initial batch of symbols
      for (let i = 0; i < 3; i++) {
        setTimeout(() => createOccultSymbol(), i * 200);
      }

      // Create occult symbols at intervals, sometimes creating multiple
      this.curseInterval = setInterval(() => {
        const count = Math.random() < 0.3 ? 2 : 1; // 30% chance to create 2 symbols
        for (let i = 0; i < count; i++) {
          setTimeout(() => createOccultSymbol(), i * 200);
        }
      }, 4000); // Reduced interval from 6000 to 4000
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

      // Create restrained overlay
      const overlay = document.createElement("div");
      overlay.className = "restrained-overlay";
      overlay.style.animation = "restrained-rise 0.8s ease-out forwards";
      document.getElementById("interface").appendChild(overlay);

      // Store reference to remove later and ensure cleanup happens
      this.restrainedInterval = setInterval(() => {
        const hasEffect = document.querySelector(".restrained-effect");
        const hasOverlay = document.querySelector(".restrained-overlay");

        if (!hasEffect || !hasOverlay) {
          console.log("AnimatedAnxiety | Cleaning up restrained effect");
          this.clearEffects();
          clearInterval(this.restrainedInterval);
          this.restrainedInterval = null;
        }
      }, 200); // Reduced interval for faster cleanup

      // Add immediate cleanup if effect is removed
      overlay.addEventListener("animationend", () => {
        const hasEffect = document.querySelector(".restrained-effect");
        if (!hasEffect) {
          console.log(
            "AnimatedAnxiety | Cleaning up restrained effect after animation"
          );
          this.clearEffects();
        }
      });
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

      // Create ethereal swirls
      this.etherealInterval = setInterval(() => {
        const swirl = document.createElement("div");
        swirl.className = "ethereal-swirl";

        // Random starting position
        swirl.style.left = `${Math.random() * 100}%`;
        swirl.style.top = `${Math.random() * 100}%`;

        // Random movement direction
        const moveX = Math.random() * 200 - 100 + "px";
        const moveY = Math.random() * 200 - 100 + "px";
        swirl.style.setProperty("--move-x", moveX);
        swirl.style.setProperty("--move-y", moveY);

        document.getElementById("interface").appendChild(swirl);
        setTimeout(() => swirl.remove(), 5000); // Match animation duration
      }, 1000);

      this.etherealCleanupInterval = setInterval(() => {
        if (!document.querySelector(".ethereal-effect")) {
          this.clearEffects();
          clearInterval(this.etherealInterval);
          clearInterval(this.etherealCleanupInterval);
          this.etherealInterval = null;
          this.etherealCleanupInterval = null;
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
    this.clearEffects();

    console.log("AnimatedAnxiety | Creating falling feather effect");

    // Function to create a falling feather
    const createFeather = () => {
      const fallingFeather = document.createElement("div");
      fallingFeather.className = "falling-feather";
      const size = Math.random() * 30 + 20; // Random size between 40px and 60px
      fallingFeather.style.width = `${size}px`;
      fallingFeather.style.height = `${size}px`;
      fallingFeather.style.top = "-50px"; // Start above the screen
      fallingFeather.style.left = `${Math.random() * 100}%`; // Random horizontal position
      fallingFeather.style.animation = "feather-fall 5s linear";
      document.getElementById("interface").appendChild(fallingFeather);

      // Remove the feather after the animation ends
      fallingFeather.addEventListener("animationend", () => {
        fallingFeather.remove();
        createFeather(); // Create a new feather after the current one falls
      });
    };

    // Create the first feather
    createFeather();

    // Add the feathers.png floating at the bottom
    const floatingFeathers = document.createElement("div");
    floatingFeathers.className = "flying-overlay";
    floatingFeathers.style.backgroundImage =
      "url('modules/animatedanxiety/assets/feathers.png')";
    floatingFeathers.style.animation =
      "flying-rise 0.8s ease-out forwards, flying-float 4s ease-in-out infinite 0.8s";
    document.getElementById("interface").appendChild(floatingFeathers);

    console.log(
      "AnimatedAnxiety | Falling feather and floating feathers added to the screen"
    );
  }

  static createHoveringEffect() {
    if (!this.hoveringInterval) {
      this.clearEffects();

      console.log("AnimatedAnxiety | Creating hovering effect");

      const overlay = document.createElement("div");
      overlay.className = "hovering-overlay";

      const imagePath = "modules/animatedanxiety/assets/hovering.png";
      overlay.style.backgroundImage = `url('${imagePath}')`;

      console.log(
        "AnimatedAnxiety | Setting hovering background image:",
        imagePath
      );

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

      console.log(
        "AnimatedAnxiety | Setting invisible background image:",
        imagePath
      );

      // Apply animations directly to ensure they're being set
      overlay.style.animation = "invisible-rise 0.8s ease-out forwards";
      setTimeout(() => {
        overlay.style.animation = "invisible-pulse 4s ease-in-out infinite";
      }, 800);

      document.getElementById("interface").appendChild(overlay);

      console.log("AnimatedAnxiety | Invisible overlay created:", overlay);
      console.log(
        "AnimatedAnxiety | Overlay animations:",
        overlay.style.animation
      );

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

      console.log(
        "AnimatedAnxiety | Setting marked background image:",
        imagePath
      );

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

  static createProneEffect() {
    if (!this.proneInterval) {
      this.clearEffects();

      console.log("AnimatedAnxiety | Creating prone effect");

      const overlay = document.createElement("div");
      overlay.className = "prone-overlay";

      const imagePath = "modules/animatedanxiety/assets/prone.png";
      overlay.style.backgroundImage = `url('${imagePath}')`;

      console.log(
        "AnimatedAnxiety | Setting prone background image:",
        imagePath
      );

      overlay.style.animation = "prone-rise 0.8s ease-out forwards";

      document.getElementById("interface").appendChild(overlay);

      console.log("AnimatedAnxiety | Prone overlay created:", overlay);

      this.proneInterval = setInterval(() => {
        if (!document.querySelector(".prone-effect")) {
          console.log("AnimatedAnxiety | Cleaning up prone effect");
          this.clearEffects();
          clearInterval(this.proneInterval);
          this.proneInterval = null;
        }
      }, 1000);
    }
  }

  static createSilencedEffect() {
    if (!this.silencedInterval) {
      this.clearEffects();

      const overlay = document.createElement("div");
      overlay.className = "silenced-overlay";
      overlay.style.animation = "silenced-rise 0.8s ease-out forwards";
      document.getElementById("interface").appendChild(overlay);

      this.silencedInterval = setInterval(() => {
        const hasEffect = document.querySelector(".silenced-effect");
        const hasOverlay = document.querySelector(".silenced-overlay");

        if (!hasEffect || !hasOverlay) {
          console.log("AnimatedAnxiety | Cleaning up silenced effect");
          this.clearEffects();
          clearInterval(this.silencedInterval);
          this.silencedInterval = null;
        }
      }, 200);

      overlay.addEventListener("animationend", () => {
        const hasEffect = document.querySelector(".silenced-effect");
        if (!hasEffect) {
          console.log(
            "AnimatedAnxiety | Cleaning up silenced effect after animation"
          );
          this.clearEffects();
        }
      });
    }
  }

  static createSleepingEffect() {
    if (!this.sleepingInterval) {
      this.clearEffects();

      const overlay = document.createElement("div");
      overlay.className = "sleeping-overlay";
      overlay.style.animation = "sleeping-rise 0.8s ease-out forwards";
      document.getElementById("interface").appendChild(overlay);

      this.sleepingInterval = setInterval(() => {
        const hasEffect = document.querySelector(".sleeping-effect");
        const hasOverlay = document.querySelector(".sleeping-overlay");

        if (!hasEffect || !hasOverlay) {
          console.log("AnimatedAnxiety | Cleaning up sleeping effect");
          this.clearEffects();
          clearInterval(this.sleepingInterval);
          this.sleepingInterval = null;
        }
      }, 200);

      overlay.addEventListener("animationend", () => {
        const hasEffect = document.querySelector(".sleeping-effect");
        if (!hasEffect) {
          console.log(
            "AnimatedAnxiety | Cleaning up sleeping effect after animation"
          );
          this.clearEffects();
        }
      });
    }
  }

  static createStableEffect() {
    if (!this.stableInterval) {
      this.clearEffects();

      const overlay = document.createElement("div");
      overlay.className = "stable-overlay";
      overlay.style.animation = "stable-rise 0.8s ease-out forwards";
      document.getElementById("interface").appendChild(overlay);

      this.stableInterval = setInterval(() => {
        const hasEffect = document.querySelector(".stable-effect");
        const hasOverlay = document.querySelector(".stable-overlay");

        if (!hasEffect || !hasOverlay) {
          console.log("AnimatedAnxiety | Cleaning up stable effect");
          this.clearEffects();
          clearInterval(this.stableInterval);
          this.stableInterval = null;
        }
      }, 200);

      overlay.addEventListener("animationend", () => {
        const hasEffect = document.querySelector(".stable-effect");
        if (!hasEffect) {
          console.log(
            "AnimatedAnxiety | Cleaning up stable effect after animation"
          );
          this.clearEffects();
        }
      });
    }
  }

  static createStunnedEffect() {
    if (!this.stunnedInterval) {
      this.clearEffects();

      const overlay = document.createElement("div");
      overlay.className = "stunned-overlay";
      overlay.style.animation = "stunned-rise 0.8s ease-out forwards";
      document.getElementById("interface").appendChild(overlay);

      this.stunnedInterval = setInterval(() => {
        const hasEffect = document.querySelector(".stunned-effect");
        const hasOverlay = document.querySelector(".stunned-overlay");

        if (!hasEffect || !hasOverlay) {
          console.log("AnimatedAnxiety | Cleaning up stunned effect");
          this.clearEffects();
          clearInterval(this.stunnedInterval);
          this.stunnedInterval = null;
        }
      }, 200);

      overlay.addEventListener("animationend", () => {
        const hasEffect = document.querySelector(".stunned-effect");
        if (!hasEffect) {
          console.log(
            "AnimatedAnxiety | Cleaning up stunned effect after animation"
          );
          this.clearEffects();
        }
      });
    }
  }

  static createSurprisedEffect() {
    if (!this.surprisedInterval) {
      this.clearEffects();

      const overlay = document.createElement("div");
      overlay.className = "surprised-overlay";
      overlay.style.animation = "surprised-rise 0.8s ease-out forwards";
      document.getElementById("interface").appendChild(overlay);

      this.surprisedInterval = setInterval(() => {
        const hasEffect = document.querySelector(".surprised-effect");
        const hasOverlay = document.querySelector(".surprised-overlay");

        if (!hasEffect || !hasOverlay) {
          console.log("AnimatedAnxiety | Cleaning up surprised effect");
          this.clearEffects();
          clearInterval(this.surprisedInterval);
          this.surprisedInterval = null;
        }
      }, 200);

      overlay.addEventListener("animationend", () => {
        const hasEffect = document.querySelector(".surprised-effect");
        if (!hasEffect) {
          console.log(
            "AnimatedAnxiety | Cleaning up surprised effect after animation"
          );
          this.clearEffects();
        }
      });
    }
  }

  static createTransformedEffect() {
    if (!this.transformedInterval) {
      this.clearEffects();

      const overlay = document.createElement("div");
      overlay.className = "transformed-overlay";

      // Add explicit path and logging
      const imagePath = "modules/animatedanxiety/assets/transformed.png";
      overlay.style.backgroundImage = `url('${imagePath}')`;
      console.log(
        "AnimatedAnxiety | Setting transformed background image:",
        imagePath
      );

      overlay.style.animation = "transformed-rise 0.8s ease-out forwards";
      document.getElementById("interface").appendChild(overlay);

      // Log the created element
      console.log("AnimatedAnxiety | Transformed overlay created:", overlay);
      console.log(
        "AnimatedAnxiety | Transformed overlay style:",
        overlay.style.backgroundImage
      );

      this.transformedInterval = setInterval(() => {
        const hasEffect = document.querySelector(".transformed-effect");
        const hasOverlay = document.querySelector(".transformed-overlay");

        if (!hasEffect || !hasOverlay) {
          console.log("AnimatedAnxiety | Cleaning up transformed effect");
          this.clearEffects();
          clearInterval(this.transformedInterval);
          this.transformedInterval = null;
        }
      }, 200);

      overlay.addEventListener("animationend", () => {
        const hasEffect = document.querySelector(".transformed-effect");
        if (!hasEffect) {
          console.log(
            "AnimatedAnxiety | Cleaning up transformed effect after animation"
          );
          this.clearEffects();
        }
      });
    }
  }
}

Hooks.once("init", () => {
  CONFIG.debug.hooks = true;
  AnimatedAnxiety.init();
});
