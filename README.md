# pp-bot

A Discord.js bot for analyzing osu!standard beatmaps and replay files with **custom-pp-v1**, a custom difficulty and performance calculation system.

## Features

- Analyze `.osr` replay files directly from Discord
- Analyze raw `.osu` beatmaps
- Custom star rating and PP calculation
- Pattern-aware difficulty analysis
- Aim, speed, precision, rhythm, control, reading, and stamina ratings
- Local strain analysis with P50, P90, P95, P99, and peak strain
- Difficulty-spike detection
- Circle-size-aware spacing and precision calculations
- Mod-aware beatmap transformation
- Accuracy, combo, miss, and map-length-aware performance penalties
- Beatmap caching by MD5

## Commands

### `/pp replay`

Upload an osu! replay:

```text
/pp replay replay:<file.osr> beatmap:<optional file.osu>
```

The replay contains the beatmap MD5 but not the complete beatmap geometry. If the map is not already cached, attach the matching `.osu` file using the `beatmap` option.

Once supplied, the map is cached under:

```text
data/beatmaps/<beatmap-md5>.osu
```

Future replays for that map can then be analyzed without uploading the beatmap again.

### `/pp beatmap`

Analyze a beatmap without a replay:

```text
/pp beatmap beatmap:<file.osu>
```

This displays the map's custom difficulty profile and PP potential.

## custom-pp-v1

`custom-pp-v1` does not use osu!'s standard PP calculator or rosu-pp for difficulty/PP calculation.

The calculator analyzes the underlying beatmap patterns and produces its own difficulty profile using:

- Aim
- Speed
- Precision
- Rhythm
- Control
- Reading
- Stamina
- Local difficulty spikes
- Circle size
- Object spacing
- Timing and effective speed
- Mods

The displayed star rating is an output of this analysis. PP potential is calculated separately from the underlying difficulty profile, meaning two maps with the same displayed star rating can have different PP potential.

The current base potential curve is:

```text
B(S) = 2250 × (1 - e^(-0.00365 × S^2.65))
```

Actual replay PP then accounts for the map's difficulty spike, mods, accuracy, combo, misses, and effective map length.

## Setup

Requires **Node.js 22+**.

```bash
npm install
```

Copy `.env.example` to `.env`:

```env
DISCORD_TOKEN=your_bot_token
DISCORD_CLIENT_ID=your_application_id
DISCORD_GUILD_ID=your_test_server_id
BEATMAP_CACHE=./data/beatmaps
```

Register the slash commands:

```bash
npm run register
```

Start the bot:

```bash
npm start
```

For development:

```bash
npm run dev
```

## Current limitations

- Only osu!standard is supported by `custom-pp-v1` currently.
- Sliderbreak count and location are not yet reconstructed from replay frames.
- Missing beatmaps currently need to be supplied as a `.osu` attachment.
- The PP and difficulty coefficients are experimental and will be calibrated against real beatmaps and replay data.

## Status

**custom-pp-v1 is experimental.** The purpose of this bot is both to calculate PP and to provide detailed diagnostics that can be used to improve and calibrate the custom difficulty system.
