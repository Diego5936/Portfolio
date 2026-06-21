# HELLO from the README.md

This is my portfolio <3 It's been fun getting to make it, but even more fun all the ideas that I've come up with.

## Implementation Details

I wanted to play around with diffusion models for a while. So I used the portfolio as a great sandbox. I thought it would be good if a diffusion image would sourround my portrait.

There are different prompts per day:
- **Monday** — Focused Monday cafe: peace, coffee, books
- **Tuesday** — Inventive Tuesday workshop: science, tools, robots
- **Wednesday** — Curious Wednesday mountains: nature, trails, animals
- **Thursday** — Creative Thursday canvas: floating shapes, paint, flowers
- **Friday** — Electric Friday city: energy, neon lights, music
- **Saturday** — Escape Saturday world: vibrant, magic, dreamy
- **Sunday** — Relaxing Sunday beach: waves, soft clouds, palm trees

The model also gets fed the month and time of day (day, sunset, night) so that it can customize the image per each user that views my portfolio!

Since I wanted the experience to be very dynamic and do not have a lot of compute the jobs per visito session needed to be correctly allocated. On the first visitor, the server runs one real diffusion job at a time on a warmed-up Python worker, every other visitor either replays that same job (same images, same timing, no extra compute) or queues the next real job once the worker is free. 

## Future Ideas

There are existing sections that I still want to improve, ideas I want to implement, and other thoughts about what else I could do (reach goals) in the future.

To Do:
- Custom sprites per skill for the skill section.
- User holds a skill npc in the air and is able to put them inside a glass vial. That will take the user to another screen where that specific skill shows off all the projects it is a part of. 
