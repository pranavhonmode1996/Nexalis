import type { Snapshot, Status, Priority } from "./types";
export function seed(): Snapshot {
  const users: Snapshot["users"] = [
    {
      id: "tariq",
      name: "Tariq Al-Hashimi",
      email: "tariq@nexalis.example",
      role: "Administrator",
      active: true,
      title: "Workspace Administrator",
      version: 1,
    },
    {
      id: "sarah",
      name: "Sarah Jenkins",
      email: "sarah@nexalis.example",
      role: "Project Manager",
      active: true,
      title: "Lead Project Manager",
      version: 1,
    },
    {
      id: "fatima",
      name: "Fatima Al-Zaabi",
      email: "fatima@nexalis.example",
      role: "Team Member",
      active: true,
      title: "Metallurgy Engineer",
      version: 1,
    },
    {
      id: "omar",
      name: "Omar Farooq",
      email: "omar@nexalis.example",
      role: "Viewer",
      active: true,
      title: "Operations Analyst",
      version: 1,
    },
    {
      id: "zayed",
      name: "Zayed Mansoor",
      email: "zayed@nexalis.example",
      role: "Team Member",
      active: true,
      title: "Pipeline Engineer",
      version: 1,
    },
    {
      id: "noora",
      name: "Noora Al-Shamsi",
      email: "noora@nexalis.example",
      role: "Team Member",
      active: false,
      title: "Quality Assurance",
      version: 1,
    },
  ];
  const projects: Snapshot["projects"] = [
    {
      id: "supplier-review",
      key: "SDR",
      name: "Supplier Document Review",
      description:
        "High-pressure valve packs, weld certificates and alloy metallurgy verification for the Habsan–Fujairah pipeline. Coordinate engineering reviews and ensure every deliverable meets the approved project standards.",
      location: "Habsan–Fujairah Pipeline",
      managerId: "sarah",
      memberIds: ["tariq", "sarah", "fatima", "omar", "zayed"],
      status: "Active",
      dueDate: "2026-11-20",
      version: 1,
    },
    {
      id: "office-hse",
      key: "HSE",
      name: "Office Operations & HSE",
      description:
        "Maintain industrial facility compliance, civil risk assessments and emergency response readiness across UAE operations.",
      location: "Abu Dhabi HQ",
      managerId: "sarah",
      memberIds: ["tariq", "sarah", "zayed"],
      status: "Active",
      dueDate: "2026-10-30",
      version: 1,
    },
    {
      id: "client-proposal",
      key: "CPP",
      name: "Client Proposal Preparation",
      description:
        "Prepare EPC packages, trenching estimates and subsea tie-in structures for upcoming offshore tender packages.",
      location: "Offshore Concession Block 14",
      managerId: "tariq",
      memberIds: ["tariq", "fatima", "omar"],
      status: "On Hold",
      dueDate: "2026-12-15",
      version: 1,
    },
    {
      id: "badi-field",
      key: "BFD",
      name: "Badi Field Phase II — Desalination",
      description:
        "Completed infrastructure handover. Commissioning records and compliance documentation remain available for reference.",
      location: "Ras Al Khaimah",
      managerId: "sarah",
      memberIds: ["tariq", "sarah", "fatima", "omar"],
      status: "Archived",
      dueDate: "2026-09-24",
      version: 1,
    },
  ];
  const titles = [
    "ASME Boiler & Pressure Vessel Inspection Sign-off",
    "Flange Joint Integrity Calculation Review",
    "Calibration Curves for Coriolis Mass Flow Meters",
    "Welder Performance Qualification Records",
    "ATEX Zone 1 Electrical Enclosure IP-Rating Certificates",
    "Hydrostatic Pressure-Test Certificates",
    "Duplex Stainless Steel 2205 Mill Test Reports",
    "Emergency Shutdown Valve Bypass Verification",
    "Cathodic Protection Potential Monitoring",
    "Ultrasonic Thickness Scan Calibration Review",
    "Safety Procedure Review",
    "Emergency Evacuation Drill",
    "Offshore Tender Cost Estimate",
    "Subsea Equipment Specifications",
    "Commissioning Handover",
  ];
  const status: Status[] = [
    "In Review",
    "Blocked",
    "In Progress",
    "To Do",
    "To Do",
    "Done",
    "Done",
    "In Progress",
    "Done",
    "In Review",
    "To Do",
    "In Progress",
    "In Review",
    "To Do",
    "Done",
  ];
  const tasks = titles.map((title, i) => ({
    id: `task-${101 + i}`,
    projectId:
      i < 10
        ? "supplier-review"
        : i < 12
          ? "office-hse"
          : i < 14
            ? "client-proposal"
            : "badi-field",
    title,
    description:
      "Review the engineering documentation against approved specifications. Record findings, coordinate with the project team and confirm all verification criteria before completion.",
    status: status[i],
    priority: ["Critical", "High", "Medium", "High", "Low"][i % 5] as Priority,
    assigneeId: ["tariq", "fatima", "zayed", "sarah", ""][i % 5],
    dueDate: `2026-${i % 3 === 0 ? "10" : "11"}-${String(7 + i).padStart(2, "0")}`,
    createdAt: "2026-10-01T08:00:00Z",
    updatedAt: "2026-10-07T10:30:00Z",
    version: 1,
  }));
  for (const t of tasks)
    if (
      !projects
        .find((p) => p.id === t.projectId)!
        .memberIds.includes(t.assigneeId)
    )
      t.assigneeId = "";
  return {
    schema: 1,
    revision: 1,
    users,
    projects,
    tasks,
    comments: [
      {
        id: "comment-1",
        taskId: "task-101",
        authorId: "fatima",
        body: "Material certificates have been checked. The pressure-test report is ready for your final review.",
        createdAt: "2026-10-07T09:15:00Z",
      },
    ],
    activities: [
      {
        id: "activity-1",
        projectId: "supplier-review",
        taskId: "task-101",
        authorId: "fatima",
        body: "submitted the pressure vessel documentation for review.",
        createdAt: "2026-10-07T09:15:00Z",
      },
      {
        id: "activity-2",
        projectId: "supplier-review",
        authorId: "sarah",
        body: "updated the project delivery schedule.",
        createdAt: "2026-10-06T11:45:00Z",
      },
    ],
    preferences: {},
    workspace: {
      name: "Nexalis International Oil & Gas",
      region: "United Arab Emirates",
      timezone: "Asia/Dubai",
      version: 1,
    },
  };
}
