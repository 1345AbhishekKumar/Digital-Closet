import type {Metadata} from 'next';
import { Inter, Anton, JetBrains_Mono } from 'next/font/google';
import { ClerkProvider, Show, UserButton } from "@clerk/nextjs";
import './globals.css'; // Global styles

const inter = Inter({
  subsets: ['latin'],
  variable: '--font-sans',
});

const anton = Anton({
  weight: '400',
  subsets: ['latin'],
  variable: '--font-display',
});

const mono = JetBrains_Mono({
  subsets: ['latin'],
  variable: '--font-mono',
});

export const metadata: Metadata = {
  title: 'WARDROBE OS',
  description: 'Experimental Digital Stylist',
};

export default function RootLayout({children}: {children: React.ReactNode}) {
  return (
    <html lang="en" className={`${inter.variable} ${anton.variable} ${mono.variable}`} suppressHydrationWarning>
      <body className="font-sans bg-[#050505] text-[#f5f5f5] antialiased selection:bg-[#CCFF00] selection:text-black" suppressHydrationWarning>
        <ClerkProvider
          appearance={{
            variables: {
              colorPrimary: '#CCFF00',
              colorBackground: 'rgba(5, 5, 5, 0.8)',
              colorForeground: '#f5f5f5',
              colorInput: 'rgba(10, 10, 10, 0.5)',
              colorInputForeground: '#f5f5f5',
              colorDanger: '#FF0000',
              fontFamily: 'var(--font-mono)',
              borderRadius: '0px',
            },
            elements: {
              cardBox: "border-4 border-[#CCFF00] bg-[#050505]/60 backdrop-blur-xl rounded-none shadow-[8px_8px_0px_0px_rgba(204,255,0,1)]",
              card: "bg-transparent rounded-none",
              headerTitle: "font-display text-4xl uppercase tracking-tighter text-[#f5f5f5] mb-2 leading-none",
              headerSubtitle: "font-mono text-[10px] uppercase tracking-widest text-[#CCFF00] mb-6 opacity-70",
              navbar: "border-r-2 border-[#CCFF00] pr-6 bg-transparent",
              navbarButton: "font-mono text-[10px] uppercase tracking-[0.2em] text-[#f5f5f5] hover:text-[#CCFF00] rounded-none px-6 py-4 mb-2 transition-all border-2 border-transparent hover:border-[#CCFF00] hover:translate-x-1",
              navbarButtonIcon: "text-[#CCFF00] group-hover:text-[#CCFF00]",
              scrollBox: "scrollbar-hide",
              pageScrollBox: "scrollbar-hide bg-transparent",
              profilePage: "bg-transparent p-0",
              profileSection: "border-b-2 border-[#CCFF00]/20 py-8 px-2 first:pt-4",
              profileSectionTitle: "mb-6",
              profileSectionTitleText: "font-display text-2xl uppercase tracking-tighter text-[#CCFF00]",
              profileSectionSubtitleText: "font-mono text-[9px] uppercase tracking-[0.3em] text-[#f5f5f5]/40 mt-1",
              profileSectionContent: "text-[#f5f5f5]",
              profileSectionPrimaryButton: "font-mono text-[9px] uppercase tracking-widest text-black bg-[#CCFF00] hover:bg-transparent hover:text-[#CCFF00] border-2 border-[#CCFF00] px-4 py-2 transition-all",
              formFieldLabel: "font-mono text-[9px] uppercase tracking-[0.2em] text-[#f5f5f5] mb-2 block opacity-70",
              formFieldInput: "border-2 border-[#f5f5f5]/30 bg-[#0a0a0a]/50 backdrop-blur-md text-[#f5f5f5] rounded-none focus:border-[#CCFF00] focus:ring-0 font-mono transition-colors p-3 text-sm",
              formButtonPrimary: "border-4 border-[#CCFF00] bg-[#CCFF00] text-[#050505] hover:bg-transparent hover:text-[#CCFF00] rounded-none shadow-[4px_4px_0px_0px_rgba(204,255,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(204,255,0,1)] transition-all font-mono uppercase tracking-[0.2em] text-[10px] font-black py-4 px-8 mt-4",
              socialButtonsBlockButton: "border-2 border-[#f5f5f5] bg-[#050505]/50 backdrop-blur-md hover:bg-[#f5f5f5] hover:text-[#050505] rounded-none shadow-[4px_4px_0px_0px_rgba(245,245,245,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(245,245,245,1)] transition-all font-mono uppercase tracking-widest text-[10px] group py-4",
              socialButtonsBlockButtonText: "font-mono font-bold uppercase",
              accordionTriggerButton: "font-mono text-xs uppercase tracking-widest text-[#f5f5f5] hover:text-[#CCFF00] py-6 border-b border-[#f5f5f5]/10",
              badge: "bg-[#CCFF00] text-[#050505] font-mono text-[8px] uppercase font-black rounded-none px-2 py-0.5",
              userButtonPopoverCard: "border-4 border-[#CCFF00] bg-[#050505]/60 backdrop-blur-xl rounded-none shadow-[8px_8px_0px_0px_rgba(204,255,0,1)] mt-4 min-w-[280px]",
              userButtonPopoverActionButton: "font-mono text-[10px] uppercase tracking-[0.2em] text-[#f5f5f5] hover:text-[#CCFF00] rounded-none px-6 py-4 flex items-center gap-4 transition-all group border-b border-[#f5f5f5]/5 last:border-0",
              userButtonPopoverActionButtonText: "font-mono font-black",
              userPreviewMainIdentifier: "font-display text-xl uppercase tracking-tighter text-[#f5f5f5] leading-none",
              userPreviewSecondaryIdentifier: "font-mono text-[8px] uppercase tracking-[0.2em] text-[#CCFF00] mt-1 opacity-70",
              userPreviewAvatarBox: "rounded-none border-2 border-[#CCFF00] w-12 h-12 shadow-[4px_4px_0px_0px_rgba(204,255,0,1)]",
              userButtonAvatarBox: "w-10 h-10 rounded-none border-2 border-[#CCFF00]",
              userButtonPopoverHeader: "border-b-2 border-[#CCFF00] pb-6 mb-2 p-6 bg-transparent",
              userButtonPopoverFooter: "hidden",
              breadcrumbsItem: "font-mono text-[9px] uppercase tracking-widest text-[#f5f5f5]/60",
              breadcrumbsItemActive: "font-mono text-[9px] uppercase tracking-widest text-[#CCFF00]",
              breadcrumbsSeparator: "text-[#CCFF00] opacity-50 mx-2",
            }
          }}
          // unsafe_disableDevelopmentModeWarnings={true}
        >
          <style>{`
            /* Global Overrides for Clerk to enforce high-contrast brutalism */
            [class^="cl-"] {
              color: #f5f5f5 !important;
              font-family: var(--font-mono) !important;
            }
            .cl-headerTitle {
              font-family: var(--font-display) !important;
              font-size: 2.25rem !important;
              letter-spacing: -0.05em !important;
              color: #f5f5f5 !important;
              text-transform: uppercase !important;
            }
            .cl-profileSectionTitleText {
              font-family: var(--font-display) !important;
              font-size: 1.5rem !important;
              color: #CCFF00 !important;
              text-transform: uppercase !important;
            }
            
            /* Navbar buttons (UserProfile sidebar) */
            .cl-navbarButton {
              border-bottom: 1px solid rgba(204, 255, 0, 0.1) !important;
              color: #f5f5f5 !important;
              background-color: transparent !important;
            }
            .cl-navbarButton:hover {
              color: #CCFF00 !important;
              background-color: rgba(204, 255, 0, 0.05) !important;
            }
            .cl-navbarButton[data-active="true"] {
              color: #CCFF00 !important;
              border-right: 4px solid #CCFF00 !important;
            }

            /* Style for "Add new key" button */
            .cl-apiKeys-addButton {
              background-color: transparent !important;
              color: #CCFF00 !important;
              border: 1px solid #CCFF00 !important;
            }

            /* Action buttons (UserButton popover) */
            .cl-userButtonPopoverActionButton {
              color: #f5f5f5 !important;
            }
            .cl-userButtonPopoverActionButton:hover {
              color: #CCFF00 !important;
              background-color: rgba(204, 255, 0, 0.05) !important;
            }
            .cl-userButtonPopoverActionButton:hover * {
              color: #CCFF00 !important;
            }

            /* Form Buttons */
            .cl-formButtonPrimary:hover {
              background-color: transparent !important;
              color: #CCFF00 !important;
              border-color: #CCFF00 !important;
            }
            
            /* Grid background for profile page content */
            .cl-pageScrollBox {
              background-image: 
                linear-gradient(rgba(204, 255, 0, 0.05) 1px, transparent 1px),
                linear-gradient(90deg, rgba(204, 255, 0, 0.05) 1px, transparent 1px) !important;
              background-size: 40px 40px !important;
            }
            /* Hide the default scrollbar */
            .cl-scrollBox::-webkit-scrollbar { display: none; }
            .cl-scrollBox { -ms-overflow-style: none; scrollbar-width: none; }
          `}</style>
          <div className="noise"></div>
          <header className="fixed top-0 right-0 p-6 z-[100]">
            <Show when="signed-in">
              <div className="bg-black border-2 border-[#CCFF00] p-1 shadow-[4px_4px_0px_0px_rgba(204,255,0,1)] hover:translate-x-[2px] hover:translate-y-[2px] hover:shadow-[2px_2px_0px_0px_rgba(204,255,0,1)] transition-all">
                <UserButton />
              </div>
            </Show>
          </header>
          {children}
        </ClerkProvider>
      </body>
    </html>
  );
}
