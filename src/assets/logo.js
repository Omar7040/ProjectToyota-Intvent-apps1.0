/**
 * Toyota Logo ASCII Art
 * 
 * ASCII representation of the Toyota logo for console display
 */

const TOYOTA_LOGO = `
    ████████╗ ██████╗ ██╗   ██╗ ██████╗ ████████╗ █████╗ 
    ╚══██╔══╝██╔═══██╗╚██╗ ██╔╝██╔═══██╗╚══██╔══╝██╔══██╗
       ██║   ██║   ██║ ╚████╔╝ ██║   ██║   ██║   ███████║
       ██║   ██║   ██║  ╚██╔╝  ██║   ██║   ██║   ██╔══██║
       ██║   ╚██████╔╝   ██║   ╚██████╔╝   ██║   ██║  ██║
       ╚═╝    ╚═════╝    ╚═╝    ╚═════╝    ╚═╝   ╚═╝  ╚═╝
                                                         
              ╔═══════════════════════════════╗
              ║   INVENTORY MANAGEMENT SYSTEM  ║
              ║      Dealer Edition v1.0       ║
              ╚═══════════════════════════════╝
`;

const TOYOTA_EMBLEM = `
                    ╭────────────────────╮
                   ╱                      ╲
                  ╱    ╭──────────────╮    ╲
                 ╱    ╱                ╲    ╲
                │    ╱   ╭──────────╮   ╲    │
                │   │   ╱            ╲   │   │
                │   │  │   TOYOTA    │  │   │
                │   │   ╲            ╱   │   │
                │    ╲   ╰──────────╯   ╱    │
                 ╲    ╲                ╱    ╱
                  ╲    ╰──────────────╯    ╱
                   ╲                      ╱
                    ╰────────────────────╯
`;

/**
 * Display the Toyota logo in the console
 */
function displayLogo() {
  console.log('\x1b[31m' + TOYOTA_LOGO + '\x1b[0m'); // Red color
}

/**
 * Display the Toyota emblem in the console
 */
function displayEmblem() {
  console.log('\x1b[31m' + TOYOTA_EMBLEM + '\x1b[0m'); // Red color
}

/**
 * Display both logo and emblem
 */
function displayFullBranding() {
  displayLogo();
  displayEmblem();
}

module.exports = {
  TOYOTA_LOGO,
  TOYOTA_EMBLEM,
  displayLogo,
  displayEmblem,
  displayFullBranding
};
