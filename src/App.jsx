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
        "Jensen Huang says the next big thing is Physical AI—AI with a body. That body is a robot.\n\nHovera makes building robots as easy as software. Describe what you want, and we handle the complexity—no CAD headaches or wiring guesswork. From idea to machine in minutes.",
    },
    {
      id: 2,
      image: "/slide_2.png",
      title: "Robotics Is Still Too Hard",
      subtitle: "",
      notes:
        "AI is ready for the physical world, but robotics tooling is stuck in the past. Today, building a simple robot requires five different fragmented tools. This friction kills ideas before they ever touch hardware. Hovera exists to close that gap.",
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
      image: "/slide_3.png",
      title: "One Prompt. Complete Robot.",
      subtitle: "",
      notes:
        "One prompt, one workflow. Hovera generates the logic, code, wiring, 3D design, simulation, and BOM. We turn intent into a complete, buildable system instantly.",
      chart: {
        center: "/hovera.png",
        segments: [
          { label: "Flowchart", icon: "GitBranch" },
          { label: "Production-ready code", icon: "Code2" },
          { label: "Wiring diagram", icon: "Zap" },
          { label: "3D design", icon: "Box" },
          { label: "Step-by-step instructions", icon: "ListChecks" },
          { label: "Simulation", icon: "Cpu" },
          { label: "BOM", icon: "FileSpreadsheet" },
        ],
      },
    },
    {
      id: 4,
      image: "/slide_4.png",
      title: "How it works",
      subtitle: "",
      isStep: true,
      notes:
        "Hovera is an intent-driven pipeline. Describe the goal, generate the system, and validate it in simulation. This ensures builders are ready to run their designs on real hardware. It doesn't replace engineers; it removes the tech friction.\n\n[DEMO]\nLet's see it: a single prompt becomes a complete robot system, tested and ready.",
    },
    {
      id: "video",
      video: "/demo.mp4", // Placeholder for demo video
      notes:
        "Watch as one prompt generates everything: the logic flowchart, wiring diagram, production code, design, and simulation. This automated workflow replaces days of manual engineering.",
    },
    {
      id: 5,
      image: "/slide_5.jpg",
      title: "Focused Early Users",
      subtitle: "",
      notes:
        "“We start with a focused market.\nEngineering students and makers.\n\nWhy? \nThey have tight deadlines, real projects, and limited budgets. They actively share tools with each other.\n\nThis is the perfect early user group to test fast before moving to labs, startups, and schools.”",
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
        "We don't just write code; we build robots. Hovera is hardware-aware and end-to-end. Our moat is our data: as Hovera learns from every validated system, it becomes harder for anyone to replicate.",
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
        "“Hovera uses a free and paid model.\n\nUsers start free, then pay as they build harder robots.\nStudents join first, then labs and teams scale up later.\n\nAs people build more robots, our business grows with them.”",
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
              "BOM",
              "Step-by-Step Guide",
              "Visual Design - Limited",
              { text: "3D Design (CAD Models)", disabled: true },
              { text: "3D Simulation", disabled: true },
              "Direct Upload to Hardware (Soon)",
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
              "BOM",
              "Step-by-Step Guide",
              "Visual Design",
              "3D Design (CAD Models)",
              "3D Simulation",
              "Direct Upload to Hardware (Soon)",
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
              "BOM",
              "Step-by-Step Guide",
              "Visual Design",
              "3D Design (CAD Models)",
              "3D Simulation",
              "Direct Upload to Hardware (Soon)",
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
              "BOM",
              "Step-by-Step Guide",
              "Visual Design",
              "3D Design (CAD Models)",
              "3D Simulation",
              "Direct Upload to Hardware (Soon)",
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
        "Existing tools like Cursor or Arduino only solve pieces of the puzzle. None connect the entire workflow from intent to hardware. That end-to-end connection is the gap Hovera fills.",
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
        "“Hovera is already in private beta.\n\nEarly users are generating complete robot systems using the full pipeline — from prompt, to testing, and validation in simulation.\n\nThe core system is live and getting better every day.”",
      timeline: {
        now: [
          "Private beta live with early users",
          "Users generating complete robot systems",
          "Prompt → simulation pipeline working",
        ],
        next: [
          "Hardware upload rollout",
          "Expand beta with more students & makers",
        ],
      },
    },
    {
      id: 10,
      image: "/slide_10.PNG",
      title: "Founder",
      subtitle: "",
      notes:
        "I'm Eki Bagas. I'm building Hovera because I personally lived the pain of the broken way we build robots. I’m building the tool I wish I had.",
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
