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
      notes:
        "“Imagine if building robots was as easy as building software.\n\nHovera lets you build real, working robots just by describing what you want.\nNo CAD headaches, no wiring guesswork, no jumping between ten different tools.\n\nFrom an idea to a working robot — in minutes.”",
    },
    {
      id: 2,
      image: "/slide_2.png",
      title: "Robotics Is Still Too Hard",
      subtitle: "",
      notes:
        "“Today, robotics is still way too hard.\n\nEven a simple robot requires stitching together multiple tools: code editors, wiring diagrams, CAD software, simulators, and firmware tools.\n\nFor students and makers, this technical friction kills ideas before they ever touch real hardware.”",
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
      notes:
        "“Hovera removes that friction.\n\nYou write a prompt describing the robot you want.\nHovera generates the entire system:\nthe logic flowchart, production-ready code, wiring diagram, 3D-printable design, simulation, and step-by-step instructions.\n\nOne prompt. One workflow. A real robot.”",
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
      notes:
        "“Hovera is an intent-driven robotics pipeline.\n\nYou describe your goal.\nHovera generates the full system.\nYou simulate it.\nThen you upload directly to hardware and run it.\n\nHovera isn’t trying to replace engineers — it removes the tech friction so they can actually build robots faster.”",
    },
    {
      id: "video",
      video: "/demo.mp4", // Placeholder for demo video
      notes:
        "Let's see it in action. Here, a single prompt turns into a complete robot system. Hovera generates the logic, tests it in simulation, and then pushes it directly to the hardware.",
    },
    {
      id: 5,
      image: "/slide_5.jpeg",
      title: "Focused Early Users",
      subtitle: "",
      notes:
        "“We start with a focused market.\nEngineering students and makers.\n\nWhy? \nThey have urgent deadlines, real projects, limited budgets, and they actively share tools with each other.\n\nThis is the perfect early adopter group to validate fast before expanding to labs, startups, and education institutions.”",
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
      notes:
        "“Most tools help you write code.\nHovera helps you build robots.\n\nIt’s end-to-end, hardware-aware, and learns from real-world builds.\nThat’s the difference.”",
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
      notes:
        "“Hovera follows a freemium, usage-based model.\n\nUsers start free, then upgrade as they build more complex robots.\nStudents upgrade first, labs and teams scale usage later.\n\nAs people build more robots, revenue grows naturally.”",
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
      notes:
        "“Existing tools only solve parts of the problem.\n\nCursor focuses on app development, not robotics.\nArduino requires manual coding.\nROS is powerful but complex.\nFritzing is manual wiring.\n\nNo existing tool generates the entire robot system from intent to hardware.\nThat’s the gap Hovera fills.”",
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
      notes:
        "“Hovera is already in public beta.\n\nEarly users are building real projects using the full pipeline — from prompt, to simulation, to direct hardware upload.\n\nThe core system is live and improving through real usage.”",
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
      notes:
        "“I’m a solo founder building this from personal pain.\n\nI’ve experienced how hard robotics is firsthand, and I’m building the tool I wish existed.”",
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
      notes:
        "“Our long-term vision is simple:\n\nMake building robots as accessible as building software.”\n\n“Hovera lowers the barrier between ideas and real machines.\n\nWe’re looking for feedback, pilot users, and early supporters to help shape the future of robotics.\n\nBuild robots as easily as software.”",
    },
  ];

  return <Presentation slides={slides} />;
}

export default App;
