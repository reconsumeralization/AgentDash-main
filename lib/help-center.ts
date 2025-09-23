import type { ComponentType } from "react"

export type HelpCategoryId = "setup" | "contacts" | "sharing" | "troubleshooting"

export interface HelpCategory {
  id: HelpCategoryId
  title: string
  description: string
  iconName: string
  totalTemplates?: number
}

export interface HelpLink {
  label: string
  url: string
}

export interface HelpArticle {
  id: string
  title: string
  summary: string
  categoryId: HelpCategoryId
  steps: string[]
  notes?: string[]
  links?: HelpLink[]
}

export interface HelpCenterData {
  categories: HelpCategory[]
  articles: HelpArticle[]
}

export interface HelpCenterMeta {
  product: string
  environment: "demo" | "live"
  generatedAt: string
}

export interface HelpCenterResponse {
  data: HelpCenterData
  meta: HelpCenterMeta
}

const helpCategories: HelpCategory[] = [
  {
    id: "setup",
    title: "Set up & Connect",
    description: "Getting FileFlex connected to your devices and accounts.",
    iconName: "settings"
  },
  {
    id: "contacts",
    title: "Import contacts",
    description: "Bring your address books from Outlook, Gmail, Yahoo, and more.",
    iconName: "users"
  },
  {
    id: "sharing",
    title: "Sharing & collaboration",
    description: "Manage secure sharing, permissions, and account access.",
    iconName: "share"
  },
  {
    id: "troubleshooting",
    title: "Troubleshooting",
    description: "Resolve connectivity, login, and performance issues.",
    iconName: "alert"
  }
]

const helpArticles: HelpArticle[] = [
  {
    id: "connect-qnap-nas",
    title: "I can't connect to my QNAP NAS",
    summary: "Create a non-admin user on your QNAP NAS and connect with FileFlex.",
    categoryId: "setup",
    steps: [
      "Install and launch QNAP Finder on a computer that shares the NAS network.",
      "Log in to the NAS with administrator credentials via QNAP Finder.",
      "Navigate to Main Menu → Control Panel → User and create a non-admin user account.",
      "Use the new user credentials when connecting the NAS inside FileFlex."
    ],
    notes: [
      "QNAP blocks remote logins with the admin account for security.",
      "Refer to the Quick Installation Guide for detailed NAS setup instructions."
    ],
    links: [{ label: "Download QNAP Finder", url: "https://www.qnap.com/en/utilities" }]
  },
  {
    id: "import-outlook",
    title: "How to import contacts from Outlook",
    summary: "Export contacts to CSV and import them into FileFlex.",
    categoryId: "contacts",
    steps: [
      "Open Outlook and navigate to File → Open & Export → Import/Export.",
      "Select 'Export to a file', choose 'Comma Separated Values', and select the Contacts folder.",
      "Browse to choose a save location for the CSV export and click Finish.",
      "In FileFlex, open Add/Manage Contacts → Import Contacts → Outlook and upload the CSV file."
    ],
    notes: [
      "Outlook 2013/2016 steps are similar; for other versions consult Microsoft's export guide."],
    links: [{ label: "Microsoft Outlook contact export guide", url: "https://support.microsoft.com/office/export-contacts" }]
  },
  {
    id: "import-gmail",
    title: "How to import contacts from Gmail",
    summary: "Export your Google contacts and upload them to FileFlex.",
    categoryId: "contacts",
    steps: [
      "Open Gmail, switch to Contacts, and choose More → Export.",
      "Select 'Old Contacts', then choose 'All Contacts' and the 'Google CSV' format.",
      "Download the generated google.csv file.",
      "In FileFlex, navigate to Add/Manage Contacts → Import Contacts → Delimited File and upload the CSV." 
    ]
  },
  {
    id: "import-yahoo",
    title: "How to import contacts from Yahoo Mail",
    summary: "Export Yahoo contacts to CSV and import them into FileFlex.",
    categoryId: "contacts",
    steps: [
      "Open Yahoo Mail, launch the Contact Manager, then choose Actions → Export.",
      "Locate the yahoo_contacts.csv file in your downloads folder.",
      "In FileFlex, go to Add/Manage Contacts → Import Contacts → Delimited File and select the CSV file." 
    ]
  },
  {
    id: "import-mobile",
    title: "How to import contacts from your mobile device",
    summary: "Pull device contacts directly into FileFlex.",
    categoryId: "contacts",
    steps: [
      "Open the FileFlex mobile app and choose Add/Manage Contacts from the menu.",
      "Select Import Contacts → Device Contacts and follow the prompts." 
    ]
  },
  {
    id: "import-linkedin",
    title: "How to import contacts from LinkedIn",
    summary: "Export Connections.csv from LinkedIn and load it into FileFlex.",
    categoryId: "contacts",
    steps: [
      "From LinkedIn, open My Network → Manage synced and imported contacts → Export contacts.",
      "Request the Connections archive, then download and unzip Connections.csv when ready.",
      "In FileFlex, go to Add/Manage Contacts → Import Contacts → Outlook and upload Connections.csv." 
    ],
    links: [{ label: "LinkedIn help: export connections", url: "https://www.linkedin.com/help/linkedin/answer/66844" }]
  },
  {
    id: "pc-password-required",
    title: "Add a password before connecting a computer",
    summary: "FileFlex requires non-blank device credentials for remote access.",
    categoryId: "setup",
    steps: [
      "Set a password on the PC or Mac you want to add to FileFlex.",
      "Avoid copying passwords with trailing spaces when entering credentials.",
      "After enabling the password, reconnect the device through FileFlex." 
    ]
  },
  {
    id: "share-files",
    title: "How FileFlex sharing works",
    summary: "Share specific files with contacts and manage permissions.",
    categoryId: "sharing",
    steps: [
      "Select files or folders in FileFlex and click the Share icon.",
      "Add contacts and choose view-only or downloadable permissions.",
      "Recipients receive a secure email invitation and temporary credentials if needed.",
      "Track access and downloads in the Activity tab." 
    ],
    notes: ["Sharing is permission-based—links cannot be forwarded without access."]
  },
  {
    id: "download-permission",
    title: "Why can't I download a shared file?",
    summary: "Either download permission wasn't granted or the host device is offline.",
    categoryId: "troubleshooting",
    steps: [
      "Confirm the sharer enabled download permissions for your contact.",
      "Ensure the host device (PC/NAS) is turned on and connected to the internet." 
    ]
  },
  {
    id: "slow-download",
    title: "Downloads are slow",
    summary: "Transfer speed depends on the sender's upload bandwidth.",
    categoryId: "troubleshooting",
    steps: ["Coordinate with the sender or host device to confirm available upload speed."]
  },
  {
    id: "unsupported-nas",
    title: "Connect an unsupported NAS",
    summary: "Use a FileFlex-connected PC or server on the same network to bridge access.",
    categoryId: "setup",
    steps: [
      "Add a PC/server on the same network to FileFlex.",
      "In FileFlex select that device, open the Network tab, and authenticate to the NAS." 
    ]
  },
  {
    id: "client-upload",
    title: "Can clients upload files to me?",
    summary: "They need a full FileFlex account or trial to upload.",
    categoryId: "sharing",
    steps: ["Ask clients to join via the 30-day trial or purchase FileFlex, then share uploads with you." ]
  },
  {
    id: "no-sync",
    title: "Does FileFlex sync data to Qnext servers?",
    summary: "No syncing or copying occurs—files stay at their source locations.",
    categoryId: "sharing",
    steps: ["FileFlex acts as a switchboard; confirm your storage remains the single source of truth."]
  },
  {
    id: "no-backups",
    title: "Does FileFlex create backups?",
    summary: "FileFlex never duplicates or backs up your files.",
    categoryId: "sharing",
    steps: ["Maintain your own backup strategy—FileFlex only streams from source devices."]
  },
  {
    id: "file-integrity",
    title: "Could a bug delete my files?",
    summary: "No—FileFlex cannot delete or corrupt files on source devices.",
    categoryId: "sharing",
    steps: ["All content remains where you stored it; FileFlex only orchestrates access."]
  },
  {
    id: "photo-sync",
    title: "Upload photos/videos from mobile",
    summary: "Enable Photo Sync to push mobile media to your NAS or other storage.",
    categoryId: "setup",
    steps: [
      "Add your NAS or target storage as a FileFlex content source.",
      "In the mobile app, configure Photo Sync to upload media automatically." 
    ]
  },
  {
    id: "nas-security-warning",
    title: "Security warning when adding a NAS",
    summary: "Use the desktop client on the same network and install the FileFlex connector.",
    categoryId: "setup",
    steps: [
      "Install the FileFlex desktop client from fileflex.com/support/downloads.",
      "Ensure the NAS and desktop are on the same network, then add the NAS as a content source.",
      "Follow vendor-specific connector installation instructions."
    ],
    links: [{ label: "Connector setup guide", url: "https://help.fileflex.com/en/connecting-to-your-content" }]
  },
  {
    id: "content-source-x",
    title: "Content source shows an X icon",
    summary: "The device is offline or the connection failed.",
    categoryId: "troubleshooting",
    steps: [
      "Verify the device is on, connected to the internet, and not sleeping.",
      "If the initial connection failed, delete the repository in FileFlex and reconnect."
    ]
  },
  {
    id: "give-contact-access",
    title: "Give a contact access to files",
    summary: "Share specific folders and monitor activity.",
    categoryId: "sharing",
    steps: [
      "Select files/folders, click Share, add contacts, and set download permissions.",
      "Recipients receive email invitations and sign in with FileFlex credentials." 
    ],
    links: [{ label: "How to share a file", url: "https://help.fileflex.com/fch/en/share-files" }]
  },
  {
    id: "reset-password",
    title: "Reset a forgotten FileFlex password",
    summary: "Use the FileFlex web login to reset credentials.",
    categoryId: "troubleshooting",
    steps: [
      "Visit https://share.fileflex.com and enter your FileFlex email.",
      "Choose Reset Password and follow the emailed instructions."
    ]
  },
  {
    id: "connect-desktop-from-mobile",
    title: "Add a desktop from mobile",
    summary: "Device activation must be initiated from the desktop itself.",
    categoryId: "setup",
    steps: ["Install and activate the FileFlex client on the desktop you wish to connect." ]
  },
  {
    id: "domain-field",
    title: "What to enter in the Domain box",
    summary: "Only corporate networks require domain credentials.",
    categoryId: "setup",
    steps: [
      "Check Control Panel → System to see if your PC belongs to a domain.",
      "If it shows WORKGROUP, leave the Domain field blank when adding the device." 
    ]
  },
  {
    id: "delete-account",
    title: "Delete my FileFlex account",
    summary: "Remove your account and all recorded activity.",
    categoryId: "sharing",
    steps: [
      "In FileFlex choose Menu → Settings → Delete my account.",
      "Confirm the deletion; only your email is retained briefly to prevent abuse." 
    ]
  },
  {
    id: "invalid-credentials",
    title: "FileFlex rejects my credentials",
    summary: "Ensure you have a password and remove trailing spaces when entering it.",
    categoryId: "troubleshooting",
    steps: ["Set a device password and avoid blank passwords or pasted spaces."]
  },
  {
    id: "nas-from-ios",
    title: "Cannot add NAS from iOS",
    summary: "Use a desktop on the same network to add NAS content sources.",
    categoryId: "setup",
    steps: ["Connect the NAS using the desktop client; afterward it appears on iOS devices."]
  },
  {
    id: "delete-all-data",
    title: "Delete all data stored in FileFlex",
    summary: "Delete your account to remove recorded activity (files remain on source devices).",
    categoryId: "sharing",
    steps: ["Use Settings → Delete my account to purge FileFlex-side data."]
  },
  {
    id: "security-warning-password",
    title: "FileFlex password rules",
    summary: "Passwords cannot be blank or include spaces.",
    categoryId: "troubleshooting",
    steps: ["Enter passwords manually and ensure no leading/trailing spaces when activating a device."]
  },
  {
    id: "determine-username",
    title: "How to determine my device username",
    summary: "Use Task Manager or Command Prompt on Windows, Sharing pane on macOS.",
    categoryId: "setup",
    steps: [
      "Windows: Ctrl+Alt+Del → Task Manager → Users tab or run 'echo %username%' in Command Prompt.",
      "macOS: Apple Menu → System Preferences → Sharing to view the computer name." 
    ]
  },
  {
    id: "cert-expiry-2020",
    title: "FileFlex no longer connects to my NAS/router/PC",
    summary: "Reinstall the latest FileFlex clients due to expired Sectigo certificate (May 2020).",
    categoryId: "troubleshooting",
    steps: [
      "Download and reinstall the FileFlex client/connector for each device.",
      "ASUS router users should reinstall via the router admin page." 
    ],
    links: [{ label: "Latest FileFlex downloads", url: "https://fileflex.com/support/downloads/download-fileflex/" }]
  },
  {
    id: "security-warning-pc",
    title: "Security warning when adding a PC",
    summary: "Enable FileFlex through firewalls and ensure the PC is online.",
    categoryId: "troubleshooting",
    steps: [
      "Confirm the PC is powered on and connected to the internet.",
      "Allow FileFlex through local and corporate firewalls if applicable." 
    ]
  }
]

export const defaultHelpCenterData: HelpCenterData = {
  categories: helpCategories,
  articles: helpArticles
}

export const defaultHelpCenterMeta: HelpCenterMeta = {
  product: "FileFlex",
  environment: "demo",
  generatedAt: new Date().toISOString()
}

export const defaultHelpCenterResponse: HelpCenterResponse = {
  data: defaultHelpCenterData,
  meta: defaultHelpCenterMeta
}
