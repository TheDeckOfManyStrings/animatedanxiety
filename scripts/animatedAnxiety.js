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
      onChange: () => this.updateAnxietyEffect(game.user?.character)
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
        step: 0.1
      },
      default: 0.6,
      onChange: () => this.updateAnxietyEffect(game.user?.character)
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
        step: 20
      },
      default: 200,
      onChange: () => this.updateAnxietyEffect(game.user?.character)
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
  }

  static updateAnxietyEffect(actor) {
    try {
      if (!game.settings.get("animatedanxiety", "enabled")) {
        const appElement = document.getElementById("interface");
        if (appElement) appElement.classList.remove("anxiety-effect");
        return;
      }

      const healthPercent = this.getHealthPercentage(actor);
      console.log("AnimatedAnxiety | Health Percentage:", healthPercent);

      // Get the app element instead of body
      const appElement = document.getElementById("interface");
      if (!appElement) {
        console.error("AnimatedAnxiety | Could not find interface element");
        return;
      }

      const blurAmount = game.settings.get("animatedanxiety", "blurAmount");

      appElement.style.setProperty(
        "--anxiety-opacity",
        this.getOpacity(healthPercent)
      );
      appElement.style.setProperty(
        "--anxiety-duration",
        this.getDuration(healthPercent)
      );
      appElement.style.setProperty("--anxiety-blur", `${blurAmount}px`);

      // Remove existing effect class if present
      appElement.classList.remove("anxiety-effect");
      // Force DOM reflow
      void appElement.offsetWidth;
      // Add effect class if health is not full
      if (healthPercent < 100) {
        appElement.classList.add("anxiety-effect");
      }
    } catch (error) {
      console.error("AnimatedAnxiety | Error:", error);
    }
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
    return Math.max(maxDuration - ((maxDuration - minDuration) * (100 - percent)) / 100, minDuration) + "s";
  }
}

Hooks.once("init", () => {
  CONFIG.debug.hooks = true;
  AnimatedAnxiety.init();
});
