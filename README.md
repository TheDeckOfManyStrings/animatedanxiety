# Animated Anxiety

Give your players anxiety!!! A Foundry VTT module that changes the players UI based on current status of their character. This module applies animations to players screens when a players character is low on health or has a status effect applied to it. Each of the animations can be turned off and on according to player preferences. This module does not share effects across screens so players can customize their game experience according to what they like.

<a href='https://ko-fi.com/thedeckofmanystrings' target='_blank'><img height='36' style='border:0px;height:36px;' src='https://storage.ko-fi.com/cdn/kofi6.png?v=6' border='0' alt='Buy Me a Coffee at ko-fi.com' /></a>

## Description

Animated Anxiety adds visually appealing overlays and animations to various character states and conditions in your game. From the anxiety-inducing red pulsing effect when health is low to magical sparkles during concentration, this module brings your character's status effects to life.

## Features

- Dynamic health-based visual effects
- Animated status conditions (30+ different effects)
- Client-side configuration for all effects
- Customizable thresholds and intensities
- Performance-optimized animations
- Foundry VTT v12 compatible

## Installation

1. Open Foundry VTT
2. Go to the "Add-on Modules" tab
3. Click "Install Module"
4. Search for "Animated Anxiety"
5. Click "Install"

## Configuration

### Accessing Module Settings

1. Go to Game Settings (the gear icon)
2. Select "Configure Settings"
3. Click on the "Module Settings" tab
4. Look for "Animated Anxiety"

### Available Settings

#### Global Settings

- **Enable/Disable Module**: Master toggle for all effects
- **Low Health Effect**: Toggle the anxiety effect when health is low
- **Anxiety Effect Threshold**: Set the health percentage (1-100) at which the anxiety effect begins
- **Show Veins Overlay**: Toggle the additional veins effect for critical health
- **Veins Threshold**: Set the health percentage for the veins overlay
- **Maximum Animation Speed**: Adjust how fast animations pulse
- **Blur Amount**: Control the intensity of blur effects

#### Individual Effect Toggles

Each status effect can be individually toggled on/off:

- Unconscious
- Poisoned
- Bleeding
- Blinded
- Cursed
- Charmed
- Concentrating
- Deafened
- Diseased
- Frightened
- Grappled
- Hiding
- Petrified
- Paralyzed
- Restrained
- And many more...

## Supported Status Effects

This module includes animations for all base DnD 5e statuses:

- Health-based anxiety effects
- Combat conditions (Prone, Grappled, etc.)
- Magical effects (Cursed, Charmed, etc.)
- Environmental conditions (Burning, Dehydrated, etc.)
- Movement states (Flying, Hovering, etc.)
- Tactical positions (Cover variations)
- Various debilitating conditions

## Performance Considerations

- All animations are optimized for performance
- Effects are client-side only
- Players can individually adjust or disable effects
- Automatic cleanup of unused animations

### WARNING: THIS MODULE MAY RUN SLOW ON SOME MACHINES.

- For users experiencing slowness, consider asking them to turn off the module in their settings using the master toggle. Other players in the game will not be affected. Please also consider submitting a bug report on the github page!

## Troubleshooting

If you experience any issues:

1. Ensure the module is up to date
2. Check if the issue persists with other modules disabled
3. Verify your Foundry VTT version is compatible
4. Clear your browser cache

## Support

For support, please:

1. Check the [Issues](https://github.com/TheDeckOfManyStrings/animatedanxiety/issues) page
2. Submit a detailed bug report if needed

## License

MIT Open License

## Credits

Created by TheDeckOfManyStrings
Special thanks to the Foundry VTT community

## Changelog

### Version 1.0.0

- Initial release
- Added 30+ status effect animations
- Implemented customizable settings
- Foundry V12 compatibility
