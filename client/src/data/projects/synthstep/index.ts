import type { Project } from "@/data/projects/types";
import loopstationdemo from "./media/loopstation-vid.gif";
import interfaceImage from "./media/interface.png";
import freeflowdemo from "./media/freeflow-jam-vid.gif";

export const synthstepProject: Project = {
  id: "synthstep",
  title: "SynthStep",
  descriptionSections: [
    {
      heading: "Inspiration",
      paragraphs: [
        "SynthStep is an interactive loop station that turns hand and body movement into music. For our ShellHacks 2025 project, we were inspired by the idea of making music more playful, accessible, and expressive. Instead of dancing to music, we wanted to reverse it... and let music be created as you move.",
        "Our goal was to build something that felt natural and experimental: a creative tool where users could step in front of a camera, move their hands or body, and start shaping sound without needing an instrument, controller, or music production experience.",
      ],
    },
    {
      heading: "What It Does",
      paragraphs: [
        "SynthStep uses camera-based motion tracking to turn movement into sound. The project maps detected motion to musical controls like instrument selection, pitch, rhythm, and volume, turning simple gestures into live musical performance.",
        "Features include:",
        "- Real-time motion-to-sound mapping using a webcam",
        "- Multiple instrument options, including drums, synths, and strings",
        "- Pitch and volume controls through interactive sliders",
        "- Camera-based body and hand movement detection",
        "- Start/stop playback controls for live interaction",
        "- A Freeflow mode that removes the traditional controls and lets users create music by simply moving",
      ],
    },
    {
      heading: "Challenges and Accomplishments",
      paragraphs: [
        "One of the biggest challenges was getting movement detection and sound timing to feel responsive and natural. Since SynthStep depends on both real-time pose tracking and real-time audio synthesis, even small delays could make the experience feel disconnected from the user’s movement. We also ran into challenges with the implementation itself... learning music theory on the fly was ambitious for a 36-hour hackathon, and because our team was only two people, we had several features we could not finish before the deadline..",
        "Even with those constraints, we created a working prototype that let users make music with movement. We built a clean, reactive interface, integrated real-time sound controls, connected camera-based tracking to musical output, and showcased a Freeflow mode where users could experiment with hands-free music creation.",
        "This was also our first hackathon in a while, and one of the biggest accomplishments was simply having a lot of fun building something creative under pressure. SynthStep reminded us how exciting hackathons can be when the project is simply a fun application of our skills and interests, as opposed to a difficult project to show off our skills.",
      ],
    },
  ],
  techs: [
    "React",
    "JavaScript",
    "Vite",
    "TensorFlow.js",
    "MoveNet",
    "Tone.js",
    "Web Audio",
    "Computer Vision",
    "Real-time / Interactive Systems",
    "Creative coding / generative music",
  ],
  links: [
    { label: "Repository", href: "https://github.com/Diego5936/SynthStep" },
    { label: "DevPost", href: "https://devpost.com/software/synthstep" },
    { label: "Video Demo", href: "https://www.youtube.com/watch?v=Y5GCjFeuXMQ&t=37s" },
  ],
  media: [
    { src: loopstationdemo, alt: "Loop Station Mode demo", kind: "gif" },
    { src: interfaceImage, alt: "Interface", kind: "image" },
    { src: freeflowdemo, alt: "Freeflow Mode demo", kind: "gif" },
  ],
};
