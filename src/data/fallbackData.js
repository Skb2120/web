export const fallbackSkills = [
  { id: 'skill-1', name: 'Embedded C/C++', level: 94, icon: 'Cpu' },
  { id: 'skill-2', name: 'ESP32 / STM32', level: 91, icon: 'Cpu' },
  { id: 'skill-3', name: 'PCB Design', level: 88, icon: 'CircuitBoard' },
  { id: 'skill-4', name: 'IoT Cloud', level: 86, icon: 'CloudCog' },
  { id: 'skill-5', name: 'React + APIs', level: 82, icon: 'Code2' },
  { id: 'skill-6', name: 'Firmware Debugging', level: 90, icon: 'Bug' },
]

export const fallbackProjects = [
  {
    id: 'project-1',
    title: 'Smart Energy Monitor',
    description: 'ESP32-based energy telemetry unit with MQTT, dashboard alerts, and calibrated current sensing.',
    techStack: ['ESP32', 'MQTT', 'ACS712', 'React'],
    imageURL: 'https://images.unsplash.com/photo-1518770660439-4636190af475?auto=format&fit=crop&w=1000&q=80',
    projectURL: '#contact',
    githubURL: 'https://github.com/',
  },
  {
    id: 'project-2',
    title: 'Industrial Sensor Gateway',
    description: 'Multi-protocol gateway for factory sensors with edge buffering and secure cloud sync.',
    techStack: ['STM32', 'RS485', 'Node.js', 'Supabase'],
    imageURL: 'https://images.unsplash.com/photo-1581092921461-eab62e97a780?auto=format&fit=crop&w=1000&q=80',
    projectURL: '#contact',
    githubURL: 'https://github.com/',
  },
  {
    id: 'project-3',
    title: 'Custom PCB Controller',
    description: 'Compact four-layer controller board with power regulation, wireless telemetry, and test pads.',
    techStack: ['KiCad', 'ESP32-S3', 'I2C', 'USB-C'],
    imageURL: 'https://images.unsplash.com/photo-1550751827-4bd374c3f58b?auto=format&fit=crop&w=1000&q=80',
    projectURL: '#contact',
    githubURL: 'https://github.com/',
  },
  {
    id: 'project-4',
    title: 'Cold Chain Data Logger',
    description: 'Battery-efficient BLE logger for temperature-sensitive delivery routes with threshold alerts.',
    techStack: ['nRF52', 'BLE', 'LiPo', 'Node.js'],
    imageURL: 'https://images.unsplash.com/photo-1563770660941-10a63607631f?auto=format&fit=crop&w=1000&q=80',
    projectURL: '#contact',
    githubURL: 'https://github.com/',
  },
  {
    id: 'project-5',
    title: 'Smart Irrigation Node',
    description: 'Solar-powered soil monitoring and pump automation node with cloud scheduling.',
    techStack: ['ESP32', 'LoRa', 'Soil Sensor', 'React'],
    imageURL: 'https://images.unsplash.com/photo-1461354464878-ad92f492a5a0?auto=format&fit=crop&w=1000&q=80',
    projectURL: '#contact',
    githubURL: 'https://github.com/',
  },
  {
    id: 'project-6',
    title: 'BLE Asset Tracker',
    description: 'Indoor asset tracking beacon system with mobile scan app and admin dashboard.',
    techStack: ['BLE', 'Android', 'Supabase', 'Vite'],
    imageURL: 'https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?auto=format&fit=crop&w=1000&q=80',
    projectURL: '#contact',
    githubURL: 'https://github.com/',
  },
  {
    id: 'project-7',
    title: 'Motor Health Analyzer',
    description: 'Vibration and current signature monitoring for predictive maintenance in factory motors.',
    techStack: ['STM32', 'FFT', 'Modbus', 'Grafana'],
    imageURL: 'https://images.unsplash.com/photo-1581093458791-9f3c3900df4b?auto=format&fit=crop&w=1000&q=80',
    projectURL: '#contact',
    githubURL: 'https://github.com/',
  },
]

export const fallbackServices = [
  {
    id: 'service-1',
    title: 'IoT Product Prototype',
    description: 'Sensor selection, firmware, cloud telemetry, dashboards, and field-ready proof of concept builds.',
    techStack: ['ESP32', 'MQTT', 'Supabase', 'React'],
    domain: 'IoT',
  },
  {
    id: 'service-2',
    title: 'Embedded Firmware',
    description: 'Low-level drivers, communication protocols, OTA flows, diagnostics, and hardware bring-up.',
    techStack: ['C/C++', 'STM32', 'FreeRTOS', 'UART'],
    domain: 'Embedded Systems',
  },
  {
    id: 'service-3',
    title: 'PCB Design Review',
    description: 'Schematic capture, layout guidance, DFM review, BOM cleanup, and manufacturing handoff.',
    techStack: ['KiCad', 'Altium', 'DFM', 'BOM'],
    domain: 'PCB Design',
  },
  {
    id: 'service-4',
    title: 'Full-Stack Dashboards',
    description: 'Realtime admin panels, device management portals, lead tracking, and authenticated workflows.',
    techStack: ['React', 'Supabase', 'Node.js', 'Vercel'],
    domain: 'Web Development',
  },
  {
    id: 'service-5',
    title: 'Sensor Calibration Suite',
    description: 'Calibration plans, characterization scripts, and production-ready sensor tuning workflows.',
    techStack: ['Python', 'Serial', 'Calibration', 'QA'],
    domain: 'Embedded Systems',
  },
  {
    id: 'service-6',
    title: 'Gateway Integration',
    description: 'Edge gateway integration with cloud ingestion, buffering, and secure device onboarding.',
    techStack: ['MQTT', 'TLS', 'Node.js', 'Docker'],
    domain: 'IoT',
  },
  {
    id: 'service-7',
    title: 'PCB Stackup Optimization',
    description: 'Layer stack planning, impedance guidance, EMC checks, and fab communication support.',
    techStack: ['Altium', 'KiCad', 'EMC', 'DFM'],
    domain: 'PCB Design',
  },
  {
    id: 'service-8',
    title: 'Admin Workflow Automation',
    description: 'Custom workflow tools for operations, lead status automation, and internal reporting.',
    techStack: ['React', 'Automation', 'Supabase', 'APIs'],
    domain: 'Web Development',
  },
]

export const fallbackMessages = [
  {
    id: 'message-demo',
    name: 'Demo Client',
    email: 'client@example.com',
    domain: 'IoT',
    idea: 'Prototype a wireless cold-chain logger.',
    message: 'I need help moving from breadboard to pilot build.',
    created_at: new Date().toISOString(),
    status: 'new',
  },
]

export const fallbackChatLeads = [
  {
    id: 'lead-demo',
    name: 'Aarav',
    phone: '+91 90000 00000',
    service: 'PCB Design',
    idea: 'A compact ESP32 controller board.',
    messages: [
      { role: 'bot', text: 'Hi, I am D.E.B.U.S Bot. What is your name?' },
      { role: 'user', text: 'Aarav' },
      { role: 'bot', text: 'How can I assist you?' },
    ],
    created_at: new Date().toISOString(),
    status: 'new',
  },
]

export const fallbackDutyExams = []
