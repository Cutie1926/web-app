# TARS Chat Application

A real-time encrypted chat application built with Next.js, Convex, and Clerk featuring direct messages, group chats, and end-to-end encryption.

## Features

### Authentication

- ✅ Sign up with email or social login (Clerk)
- ✅ Sign in / Log out
- ✅ User profiles with avatar and name

### Messaging

- ✅ One-on-one direct messages
- ✅ Group chat with multiple members
- ✅ Real-time message delivery
- ✅ Message encryption/decryption
- ✅ Delete own messages (soft delete)
- ✅ Emoji reactions on messages (👍 ❤️ 😂 😮 😢)

### User Experience

- ✅ Online/offline status indicators
- ✅ Typing indicators ("user is typing...")
- ✅ Unread message badges
- ✅ Smart auto-scroll (shows "New messages" button if user scrolled up)
- ✅ Last seen timestamps
- ✅ User search and discovery
- ✅ Responsive design (desktop & mobile)

### Message Timestamps

- Today: `2:34 PM`
- This year: `Feb 15, 2:34 PM`
- Different year: `Feb 15, 2023, 2:34 PM`

## Tech Stack

- **Frontend**: Next.js 16, React 19, TypeScript
- **Styling**: Tailwind CSS 4
- **Backend**: Convex (real-time database)
- **Authentication**: Clerk
- **Encryption**: CryptoJS
- **UI Components**: Custom + Radix UI

## Setup Instructions

### 1. Clone and Install Dependencies

```bash
npm install
# or
yarn install
```

### 2. Configure Clerk

1. Create a Clerk account at https://clerk.com
2. Create a new application
3. Copy your keys:
   - `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
   - `CLERK_SECRET_KEY`

### 3. Setup Convex

1. Create a Convex account at https://convex.dev
2. Install Convex CLI:
   ```bash
   npm install -g convex
   ```
3. Initialize Convex:
   ```bash
   convex auth add
   ```
4. Select "Clerk" as authentication provider
5. Configure with your Clerk keys
6. Deploy schema:
   ```bash
   convex deploy
   ```

### 4. Environment Variables

Create `.env.local` in the project root:

```env
# Clerk
NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY=pk_test_xxxxx
CLERK_SECRET_KEY=sk_test_xxxxx

# Convex
NEXT_PUBLIC_CONVEX_URL=https://your-deployment.convex.cloud

# Encryption (optional - use custom key in production)
NEXT_PUBLIC_ENCRYPTION_KEY=your-secret-key-here
```

### 5. Run Development Server

```bash
npm run dev
# or
yarn dev
```

Open http://localhost:3000 in your browser.

## Project Structure

```
tars/
├── app/                          # Next.js App Router
│   ├── page.tsx                 # Home (redirects to chat/sign-in)
│   ├── layout.tsx               # Root layout with providers
│   ├── globals.css              # Global styles
│   ├── sign-in/                 # Clerk sign-in page
│   ├── sign-up/                 # Clerk sign-up page
│   └── chat/
│       ├── page.tsx             # Chat home (conversation list)
│       ├── layout.tsx           # Chat layout with sidebar
│       ├── [conversationId]/    # Individual conversation
│       └── new-group/           # Create group modal
│
├── components/
│   ├── chat/                    # Chat UI components
│   │   ├── ChatWindow.tsx       # Main chat container
│   │   ├── MessageList.tsx      # Messages display
│   │   ├── MessageItem.tsx      # Individual message
│   │   ├── MessageInput.tsx     # Input for typing
│   │   ├── TypingIndicator.tsx  # "User is typing..."
│   │   ├── ReactionBar.tsx      # Emoji reactions
│   │   ├── DeleteMessageButton/ # Delete message action
│   │   └── OnlineStatus.tsx     # Online/offline status
│   │
│   ├── sidebar/                 # Sidebar components
│   │   ├── ConversationList.tsx # List of conversations
│   │   ├── ConversationItem.tsx # Single conversation tile
│   │   ├── UserSearch.tsx       # Search users
│   │   └── GroupCreateModal.tsx # Create group dialog
│   │
│   ├── ui/                      # Reusable UI components
│   │   ├── Avatar.tsx           # User avatar
│   │   ├── Button.tsx           # Button component
│   │   ├── Input.tsx            # Input field
│   │   └── Dialog.tsx           # Modal dialog
│   │
│   ├── loaders/                 # Loading states
│   │   └── index.tsx            # Spinner, skeleton loaders
│   │
│   └── providers/
│       └── ConvexProvider.tsx   # Convex setup
│
├── convex/                       # Backend functions
│   ├── schema.ts                # Database schema
│   ├── users.ts                 # User operations
│   ├── conversations.ts         # Conversation management
│   ├── messages.ts              # Message CRUD
│   ├── reactions.ts             # Emoji reactions
│   ├── typing.ts                # Typing indicators
│   ├── presence.ts              # Online status
│   ├── groups.ts                # Group operations
│   └── unreadMessages.ts        # Unread count tracking
│
├── hooks/                        # Custom React hooks
│   ├── useTyping.ts             # Typing indicator hook
│   ├── useOnlineStatus.ts       # Online status tracking
│   ├── useAutoScroll.ts         # Auto-scroll messages
│   └── useEncryption.ts         # Encrypt/decrypt messages
│
├── lib/                          # Utilities
│   ├── utils.ts                 # Helper functions
│   ├── encryption.ts            # AES encryption
│   ├── dateFormatter.ts         # Date formatting
│   ├── errorHandler.ts          # Error handling
│   └── clerkSync.ts             # Sync Clerk with Convex
│
├── middleware.ts                 # Auth middleware
├── .env.local                    # Environment variables
├── convex.json                   # Convex config
└── package.json                  # Dependencies
```

## Encryption Details

Messages are encrypted on the client side before sending to Convex:

1. **Encryption**: User types message → `encryptMessage()` → AES encrypted string → Send to server
2. **Storage**: Server stores encrypted content
3. **Decryption**: When message loads → `decryptMessage()` → Display decrypted content to recipient

The encryption key is in `NEXT_PUBLIC_ENCRYPTION_KEY`. For production, use a secure key management system.

## Key Features Explained

### Real-Time Updates

Uses Convex subscriptions for real-time message, typing indicator, and presence updates.

### Auto-Scroll

- Automatically scrolls to latest message
- If user scrolls up, shows "↓ New Messages" button
- Prevents jarring auto-scroll of old messages

### Unread Badges

- Tracks unread count per conversation
- Cleared when user opens conversation
- Shows count in conversation list

### Typing Indicators

- Shows "User is typing..." when another user types
- Auto-clears after 2 seconds of inactivity
- Real-time across all participants

### Online Status

- Green indicator next to online users
- Updates in real-time via presence tracking
- Shows "Last seen X minutes ago" for offline users

## Deployment

### Deploy to Vercel

```bash
vercel deploy
```

Set environment variables in Vercel dashboard:

- `CLERK_SECRET_KEY`
- `NEXT_PUBLIC_CLERK_PUBLISHABLE_KEY`
- `NEXT_PUBLIC_CONVEX_URL`
- `NEXT_PUBLIC_ENCRYPTION_KEY`

## Common Issues

### "Convex URL not found"

Make sure `NEXT_PUBLIC_CONVEX_URL` is set in `.env.local`

### Messages not sending

Check that Clerk is configured and user is synced to Convex

### Encryption errors

Verify `NEXT_PUBLIC_ENCRYPTION_KEY` is set consistently

### Real-time updates not working

Ensure Convex deployment is active and queries have proper subscriptions

## License

MIT

This project uses [`next/font`](https://nextjs.org/docs/app/building-your-application/optimizing/fonts) to automatically optimize and load [Geist](https://vercel.com/font), a new font family for Vercel.

## Learn More

To learn more about Next.js, take a look at the following resources:

- [Next.js Documentation](https://nextjs.org/docs) - learn about Next.js features and API.
- [Learn Next.js](https://nextjs.org/learn) - an interactive Next.js tutorial.

You can check out [the Next.js GitHub repository](https://github.com/vercel/next.js) - your feedback and contributions are welcome!

## Deploy on Vercel

The easiest way to deploy your Next.js app is to use the [Vercel Platform](https://vercel.com/new?utm_medium=default-template&filter=next.js&utm_source=create-next-app&utm_campaign=create-next-app-readme) from the creators of Next.js.

Check out our [Next.js deployment documentation](https://nextjs.org/docs/app/building-your-application/deploying) for more details.
