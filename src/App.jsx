import { useState } from "react";
import Presentation from "./components/Presentation";
import "./App.css";

function App() {
  const slides = [
    {
      id: 1,
      image: "/slide_1.png",
      title: "Build Robots with Just Prompts",
      subtitle: "From idea to working robot in minutes",
    },
    {
      id: 2,
      image: "/slide_2.png",
      title: "Robotics Is Still Too Hard",
      subtitle: "",
      topMessages: [
        "Too many tools, no single workflow",
        "Too much technical friction",
        "Ideas die before becoming real machines",
      ],
      tools: Array.from({ length: 25 }, (_, i) => i + 1)
        .filter((num) => num !== 12)
        .map((num) => `/tools/image ${num}.png`),
    },
    {
      id: 3,
      image: "/slide_3.jpeg",
      title: "One Prompt. Complete Robot.",
      subtitle: "",
      chart: {
        center: "/hovera.png",
        segments: [
          { label: "Flowchart", icon: "GitBranch" },
          { label: "Production-ready code", icon: "Code2" },
          { label: "Wiring diagram", icon: "Zap" },
          { label: "3D design", icon: "Box" },
          { label: "Step-by-step instructions", icon: "ListChecks" },
          { label: "Simulation", icon: "Cpu" },
        ],
      },
    },
    {
      id: 4,
      image: "/slide_4.jpeg",
      title: "How it works",
      subtitle: "",
    },
    {
      id: "video",
      video: "/demo.mp4", // Placeholder for demo video
    },
    {
      id: 5,
      image: "/slide_5.jpeg",
      title: "Focused Early Users",
      subtitle: "",
      users: [
        { image: "/student.png", title: "Engineering students" },
        { image: "/maker.png", title: "Makers and hobbyists" },
      ],
      whyThem: {
        image: "/why_them.png",
        title: "Why them?",
        subtitle: "Urgent projects, deadlines, fast feedback",
      },
    },
    {
      id: 6,
      title: "Why Hovera Is Different",
      subtitle: "",
      chart: {
        center: "/hovera.png",
        segments: [
          {
            label: "End-to-End Pipeline",
            icon: "Infinity",
            description:
              "No need for fragmented tools; Hovera provides a seamless, integrated experience from concept to creation.",
          },
          {
            label: "Hardware-Aware AI",
            icon: "Cpu",
            description:
              "Our AI deeply understands hardware constraints and capabilities, generating optimized and functional designs.",
          },
          {
            label: "Learning Loop from Real Builds",
            icon: "BookOpen",
            description:
              "Every robot built feeds into our system, making Hovera smarter and more robust with each iteration.",
          },
        ],
      },
    },
    {
      id: 7,
      image: "/slide_7.png",
      title: "Built for Adoption First, Scale Later",
      subtitle: "",
      pricing: {
        whoPays: "Students, makers, and companies at scale",
        plans: [
          {
            name: "Hobby",
            price: "Free",
            credits: "100 credits",
            features: [
              "Complete Source Code",
              "Interactive Flowchart",
              "Wiring Diagrams",
              "Step-by-Step Guide",
              "Visual Design - Limited",
              { text: "3D Design (CAD Models)", disabled: true },
              { text: "3D Simulation", disabled: true },
              "Direct Upload to Hardware",
            ],
          },
          {
            name: "Pro",
            price: "$20",
            credits: "200 credits",
            popular: true,
            features: [
              "Complete Source Code",
              "Interactive Flowchart",
              "Wiring Diagrams",
              "Step-by-Step Guide",
              "Visual Design",
              "3D Design (CAD Models)",
              "3D Simulation",
              "Direct Upload to Hardware",
            ],
          },
          {
            name: "Business",
            price: "$60",
            credits: "600 credits",
            features: [
              "Complete Source Code",
              "Interactive Flowchart",
              "Wiring Diagrams",
              "Step-by-Step Guide",
              "Visual Design",
              "3D Design (CAD Models)",
              "3D Simulation",
              "Direct Upload to Hardware",
            ],
          },
          {
            name: "Super",
            price: "$200",
            credits: "2,000 credits",
            features: [
              "Complete Source Code",
              "Interactive Flowchart",
              "Wiring Diagrams",
              "Step-by-Step Guide",
              "Visual Design",
              "3D Design (CAD Models)",
              "3D Simulation",
              "Direct Upload to Hardware",
            ],
          },
        ],
      },
    },
    {
      id: 8,
      image: "/slide_8.png",
      title: "Why Existing Tools Fall Short",
      subtitle: "",
      competitors: [
        {
          name: "Cursor",
          logo: "/tools/cursor.png",
          description: "app dev, not dedicated for robotics",
        },
        {
          name: "Arduino",
          logo: "/tools/image 1.png",
          description: "manual code, no AI",
        },
        {
          name: "ROS",
          logo: "/tools/image 4.png",
          description: "powerful but complex",
        },
        {
          name: "Fritzing",
          logo: "/tools/image 2.png",
          description: "manual wiring",
        },
      ],
    },
    {
      id: 9,
      image: "/slide_9.png",
      title: "Where We Are",
      subtitle: "",
      timeline: {
        now: [
          "Public beta live with early users",
          "Real projects built using Hovera",
          "Prompt → simulation → hardware upload working",
        ],
        next: [
          "Expand beta with more students & makers",
          "Improve reliability and hardware support",
        ],
      },
    },
    {
      id: 10,
      image: "/slide_10.PNG",
      title: "Founder",
      subtitle: "",
      founder: [
        "Eki Bagas - Solo founder",
        "Robotics + software background",
        "Built from personal pain",
      ],
    },
    {
      id: 11,
      image: "/slide_11.PNG",
      title: "Make building robots as accessible as building software.",
      subtitle: "",
    },
  ];

  return <Presentation slides={slides} />;
}

export default App;
