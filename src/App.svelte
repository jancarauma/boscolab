
<!-- oṁ tat sat -->
<script lang="ts">
  import { inject } from '@vercel/analytics';
  import { onDestroy, onMount, tick, type ComponentEvents } from "svelte";
  import { type Cell, cellFactory } from "./cells/Cells";
  import { BaseCell } from "./cells/BaseCell";
  import MathCell from "./cells/MathCell";
  import TableCell from "./cells/TableCell";
  import DataTableCell, { type InterpolationFunction } from "./cells/DataTableCell";
  import PlotCell from "./cells/PlotCell";
  import PiecewiseCell from "./cells/PiecewiseCell";
  import SystemCell from "./cells/SystemCell";
  import FluidCell from "./cells/FluidCell";
  import { cells, title, results, resultsInvalid, system_results, sub_results,
           history, insertedSheets, activeCell, getSheetJson, getSheetObject, resetSheet, sheetId,
           mathCellChanged, nonMathCellChanged, addCell, prefersReducedMotion, modifierKey,
           inCellInsertMode, config, unsavedChange, incrementActiveCell,
           decrementActiveCell, deleteCell, activeMathField, autosaveNeeded, mathJaxLoaded } from "./stores";
  import { isDefaultConfig, type Config, normalizeConfig } from "./sheet/Sheet";
  import type { Statement, SubQueryStatement } from "./parser/types";
  import type { SystemDefinition } from "./cells/SystemCell";
  import type { FluidFunction } from "./cells/FluidCell";
  import { isVisible, versionToDateString, debounce, saveFileBlob, sleep, createCustomUnits } from "./utility";
  import type { ModalInfo, RecentSheets, RecentSheetUrl, RecentSheetFile, StatementsAndSystems } from "./types";
  import type { Results } from "./resultTypes";
  import { getHash, API_GET_PATH, API_SAVE_PATH } from "./database/utility";
  import type { SheetPostBody, History } from "./database/types";
  import { type Sheet, getDefaultConfig } from "./sheet/Sheet";
  import CellList from "./CellList.svelte"; 
  import type { MathField } from "./cells/MathField";
  import DocumentTitle from "./DocumentTitle.svelte";
  import UnitsDocumentation from "./UnitsDocumentation.svelte";
  import KeyboardShortcuts from "./KeyboardShortcuts.svelte";
  import Terms from "./Terms.svelte";
  import RequestPersistentStorage from "./RequestPersistentStorage.svelte";
  import Updates from "./Updates.svelte";
  import InsertSheet from "./InsertSheet.svelte";
  import DropOverlay from "./DropOverlay.svelte";
  import UpdateAvailable from "./UpdateAvailable.svelte";
  import VirtualKeyboard from "./VirtualKeyboard.svelte";
  import { keyboards } from "./keyboard/Keyboard";
  import { Workbox } from "workbox-window";
  import { MathfieldElement } from "mathlive";
  import { serviceWorkerUpdateWaiting } from './stores.js';

  import QuickLRU from "quick-lru";

  import { get, set, update, delMany } from 'idb-keyval';

  import {
    Modal,
    InlineLoading,
    CopyButton,
    Header,
    SkipToContent,
    HeaderUtilities,
    HeaderGlobalAction,
    Checkbox,
    Content,
    SideNav,
    SideNavMenuItem,
    SideNavMenu,
    SideNavItems,
    SideNavLink,
    HeaderActionLink,
    Tabs,
    Tab,
    TabContent
  } from "carbon-components-svelte";

  import CloudUpload from "carbon-icons-svelte/lib/CloudUpload.svelte";
  import Document from "carbon-icons-svelte/lib/Document.svelte";
  import DocumentBlank from "carbon-icons-svelte/lib/DocumentBlank.svelte";
  import Ruler from "carbon-icons-svelte/lib/Ruler.svelte";
  import Help from "carbon-icons-svelte/lib/Help.svelte";
  import Launch from "carbon-icons-svelte/lib/Launch.svelte";
  import Keyboard from "carbon-icons-svelte/lib/Keyboard.svelte";
  import InformationFilled from "carbon-icons-svelte/lib/InformationFilled.svelte";
  import ErrorFilled from "carbon-icons-svelte/lib/ErrorFilled.svelte";
  import Download from "carbon-icons-svelte/lib/Download.svelte";
  import Renew from "carbon-icons-svelte/lib/Renew.svelte";
  import ArrowLeft from "carbon-icons-svelte/lib/ArrowLeft.svelte";
  import ArrowRight from "carbon-icons-svelte/lib/ArrowRight.svelte";
  import Printer from "carbon-icons-svelte/lib/Printer.svelte";
  import SettingsAdjust from "carbon-icons-svelte/lib/SettingsAdjust.svelte";

  import 'katex/dist/katex.min.css';
  import katex from 'katex';
  import 'quill/dist/quill.snow.css';
  import 'carbon-components-svelte/css/white.css';
  import MathCellConfigDialog from "./MathCellConfigDialog.svelte";
  import type MathCellElement from "./MathCell.svelte";
  import GenerateCodeDialog from "./GenerateCodeDialog.svelte";
  import CustomMatrixModal from "./CustomMatrixModal.svelte";
  import BaseUnitsConfigDialog from "./BaseUnitsConfigDialog.svelte";
  import DownloadDocumentModal from "./DownloadDocumentModal.svelte";
  import { getBlankStatement } from "./parser/LatexToSympy";
  import SetDefaultConfigDialog from "./SetDefaultConfigDialog.svelte";
  import { Folder } from "carbon-icons-svelte";

  createCustomUnits();

  const apiUrl = window.location.origin;

  const currentVersion = 20241123;
  const tutorialHash = "a337041f9f6dec0c714a0e";

  const termsVersion = 20250111;
  let termsAccepted = 0;

  // need for File System Access API calls
  const fileTypes = [
            {
              description: "Boscolab Files",
              accept: {"application/json": [".blab"]},
            }
          ];

  const exampleSheets = [
    {
      path: `/${tutorialHash}`,
      title: "Apresentação ao Boscolab"
    },/*
    {
      path: "/g4MZrw8GUPdHBSUTzGbQjb",
      title: "Plotting and Functions" 
    },
    {
      path: "/32XmqQA442GL8mj8X9uwP3",
      title: "Scatter Plots" 
    },
    {
      path: "/dcM95gSLeCTcbCHtsM4uqq",
      title: "Parametric Plots" 
    },
    {
      path: "/DeP4bqfF2H5VbRJz3Nd9Re",
      title: "Equation Solving" 
    },
    {
      path: "/V53SzSCEixmE9MQz6m66mk",
      title: "Matrices and Vectors" 
    },
    {
      path: "/hnh9wDMhEfXjDPUzpn9cTS",
      title: "Data Tables" 
    },
    {
      path: "/enYmu2PzN2hN93Avizx9ec",
      title: "Python Code Generation" 
    },
    {
      path: "/mWf3zkzQEmYsUPckCPX5P8",
      title: "Thermodynamic Properties of Fluids" 
    },*/
  ];

  const prebuiltTables = [
    {
      url: "https://boscolab.vercel.app/PaFvsBhgoJdZEEwyBLPnD6",
      title: "Propriedades Mecânicas de Metais" 
    },
    {
      url: "https://boscolab.vercel.app/QF5ThTJMUhn2sLBxM4Vyr9",
      title: "Coeficientes de Atrito" 
    },
    {
      url: "https://boscolab.vercel.app/FwahHU9W8ht28t9p4LNqFd",
      title: "Coeficientes de Diltação Térmica" 
    },
    {
      url: "https://boscolab.vercel.app/iBxxaDryEV8NkdrNdsZzvF",
      title: "Propriedades Elétricas de Condutores" 
    },
    {
      url: "https://boscolab.vercel.app/EyXiBtFajaDHpxqRpvGQFX",
      title: "Propriedades Dielétricas" 
    },
    {
      url: "https://boscolab.vercel.app/EnZhHT9wvsESXvRChZ7TLV",
      title: "Propriedades de Líquidos" 
    },
    {
      url: "https://boscolab.vercel.app/bPX72mmrNjVsgZbos25Gkw",
      title: "Propriedades de Seções de Viga" 
    },
    {
      url: "https://boscolab.vercel.app/XvB4X3qGDZoupFyRCLbWmL",
      title: "Propriedades de W-Beam" 
    },
    {
      url: "https://boscolab.vercel.app/ndyjJRwvqoJBfVLw7BGFfu",
      title: "Frequências de Notas Musicais" 
    }
  ];

  // Provide global function for setting latex for MathField
  // this is used for testing
  (window as any).setCellLatex = function (cellIndex: number, latex: string, subIndex?: number) {
    const cell = $cells[cellIndex];
    if ( cell instanceof MathCell) {
      cell.mathField.element.setLatex(latex);
    } else if ( cell instanceof SystemCell) {
      if (subIndex !== undefined) {
        cell.expressionFields[subIndex].element.setLatex(latex);
      }
    } else if (cell instanceof PlotCell) {
      if (subIndex !== undefined) {
        cell.mathFields[subIndex].element.setLatex(latex);
      }
    } else if (cell instanceof DataTableCell) {
      if (subIndex !== undefined) {
        cell.parameterFields[subIndex].element.setLatex(latex);
      }
    }
  };

  // used for testing so that correct modifier key is used in tests
  (window as any).modifierKey = $modifierKey;

  // Used for testing to force Nova Planilha even with unsaved changes.
  // This is necessary since dismissing the unsaved changes dialog in playwright doesn't work after the first
  // time it is requested.
  (window as any).forceLoadBlankSheet = () => {$unsavedChange = false; loadBlankSheet();};

  // Used for testing to simplify the deleting of cells
  // The two-step delete, delete and then delete the undo delete cell, 
  // can be flaky for firefox and webkit
  // webkit in particular waits for the progress bar to go down before playwright considers the DOM stable
  (window as any).forceDeleteCell = (index: number) => deleteCell(index, true);

  // For quicker startup times, mathjax is loaded after the main bundle
  // Need to update the $mathJaxLoaded value so that plots can update, if needed.
  (window as any).MathJax = {
    startup: {
      ready: () => {
          (window as any).MathJax.startup.defaultReady();
          $mathJaxLoaded = true;
        },
      pageReady: async () => {} // prevents the initial typeSetting of the page, must return a promise
    }
  };

  MathfieldElement.fontsDirectory = `${window.location.protocol}//${window.location.host}/build/mathlive/fonts`;
  MathfieldElement.soundsDirectory = `${window.location.protocol}//${window.location.host}/build/mathlive/sounds`;
  MathfieldElement.computeEngine = null;
  MathfieldElement.plonkSound = null;

  // start webworker for python calculations
  let pyodideWorker, pyodideTimeout;
  let pyodideTimeoutRef = 0;
  let pyodideLoaded;
  let pyodideNotAvailable;
  let forcePyodidePromiseRejection;
  let pyodidePromise = null;
  let pyodideLoadingTimeoutRef = 0;
  const pyodideTimeoutLength = 2000;
  const pyodideLoadingTimeoutLength = 60000;
  let error = null;
  let noParsingErrors = true;
  let inDebounce = false;

  let usingDefaultConfig = true;

  let recentSheets: RecentSheets = new Map();
  const maxRecentSheetsLength = 50;

  let currentState = "/"; // used when popstate is cancelled by user
  let currentStateObject: null | {fileKey: string} = null;
  let refreshingSheet = false; // since refreshSheet is async, need to make sure more than one call is not happening at once
  let populatingPage = false; // ditto for populatePage
  let initialSheetLoad = false;

  const autosaveInterval = 10000; // msec between check to see if an autosave is needed
  const checkpointPrefix = "temp-checkpoint-";
  let numCheckpoints = 500; 
  const minNumCheckpoints = 10;
  const decrementNumCheckpoints = 20; 
  let autosaveIntervalId: null | number = null;

  let showKeyboard = false;

  let inIframe = false;
  let autosizeIframeId = "";

  let fileDropActive = false;

  let refreshCounter = BigInt(1);
  let cache = new QuickLRU<string, Results>({maxSize: 100}); 
  let cacheHitCount = 0;

  let sideNavOpen = false;

  //let serviceWorkerUpdateWaiting = false;
  let checkServiceWorkerIntervalId: null | number = null;
  
  let modalInfo:ModalInfo = {
    state: "uploadSheet", 
    modalOpen: false, 
    heading: "Obter Link Compartilhável",
  };

  let mathCellConfigDialog: MathCellConfigDialog | null = null;
  let baseUnitsConfigDialog: BaseUnitsConfigDialog | null = null;
  let cellList: CellList;

  function startWebWorker() {
    if (pyodideLoadingTimeoutRef) {
      clearTimeout(pyodideLoadingTimeoutRef);
    }    
    error = null;
    pyodideLoaded = false;
    pyodideNotAvailable = false;
    pyodideWorker = new Worker("webworker.js");

    pyodidePromise = new Promise((resolve, reject) => {
      pyodideWorker.onmessage = function (message) {
        if (message.data === "pyodide_loaded") {
          pyodideLoaded = true;
          error = null;
          resolve(true);
        } else if (message.data === "pyodide_not_avaiable") {
          pyodideNotAvailable = true;
          reject("Pyodide failed to load.");
        }
      }
    });
    pyodideTimeout = false;

    pyodideLoadingTimeoutRef = window.setTimeout(() => {
      if(!pyodideLoaded) {
        error = "Pyodide failed to load. Refreshing page may help.";
      }
    }, pyodideLoadingTimeoutLength);
  }
  function terminateWorker() {
    if (pyodideWorker) {
      pyodideWorker.terminate();
      pyodideWorker = null;
    }
  }
  startWebWorker();

  
  onDestroy(() => {
    window.removeEventListener("popstate", handleSheetChange);
    window.removeEventListener("beforeunload", handleBeforeUnload);
    window.removeEventListener("keydown", handleKeyboardShortcuts);
    window.removeEventListener("beforeprint", handleBeforePrint);
    terminateWorker();
    if (autosaveIntervalId) {
      window.clearInterval(autosaveIntervalId);
    }
    if (checkServiceWorkerIntervalId) {
      window.clearInterval(checkServiceWorkerIntervalId);
    }
  });

  onMount( async () => {
    //injectAnalytics({ mode: dev ? 'development' : 'production' });
    inject({ mode: 'production' });

    // let katex globally available
    if (typeof window !== 'undefined') {
      window.katex = katex;
    }

    // update main content element so that top of page will scroll into view when clicked
    const anchorElement = document.querySelector('div[slot="skip-to-content"] > a.bx--skip-to-content');
    if (anchorElement) {
      anchorElement.setAttribute('href', '#sheet'); 
    }

    const mediaQueryList = window.matchMedia('(prefers-reduced-motion: reduce)');
    $prefersReducedMotion = mediaQueryList.matches
    mediaQueryList.addEventListener('change', handleMotionPreferenceChange);

    $unsavedChange = false;
    $autosaveNeeded = false;
    await refreshSheet(true);

    window.addEventListener("popstate", handleSheetChange);
    window.addEventListener("beforeunload", handleBeforeUnload);
    window.addEventListener("keydown", handleKeyboardShortcuts);
    window.addEventListener("beforeprint", handleBeforePrint);

    autosaveIntervalId = window.setInterval(saveLocalCheckpoint, autosaveInterval);

    if ( window.self !== window.top) {
      inIframe = true;
    }

    if (!inIframe) {
      let firstTime = true;

      try {
        const previousVisit = await get('previousVisit');
        const localTermsAccepted = await get('termsAccepted');
        if (localTermsAccepted === undefined || localTermsAccepted === true) {
          // need to check against true since this feature initially stored
          // true in local storage when terms were accepted
          termsAccepted = 0;
        } else {
          termsAccepted = localTermsAccepted;
        }
        if (previousVisit) {
          firstTime = false;
        }
      } catch(e) {
        firstTime = true;
        termsAccepted = 0;
        console.log(`Error checking if first use: ${e}`);
      }

      if (firstTime) {
        try {
          await set('previousVisit', true);
        } catch (e) {
          console.log(`Error updating previousVist entry: ${e}`);
        }
      } else {
        // if not first time, let user know if there is a new feature release
        let previousVersion: number;
        try {
          previousVersion = await get('previousVersion');
          if (!previousVersion) {
            previousVersion = 0;
          }
        } catch(e) {
          previousVersion = 0;
          console.log(`Error checking previous version: ${e}`);
        }

        if (currentVersion > previousVersion) {
            modalInfo = {
              modalOpen: true,
              state: "newVersion",
              heading: "New Features"
          }
        }
      }

      // set previousVersion in local storage to current version
      try {
        await set('previousVersion', currentVersion);
      } catch (e) {
        console.log(`Error updating previousVersion entry: ${e}`);
      }

      // get recent sheets list
      await retrieveRecentSheets();

      // get prevoiusly defined numCheckpoints if available
      try {
        const localNumCheckpoints = await get('numCheckpoints');
        if (localNumCheckpoints) {
          numCheckpoints = Math.max(minNumCheckpoints, localNumCheckpoints);
        }
      } catch (e) {
        console.log(`Error getting numCheckpoints: ${e}`);
      }

    } else if(autosizeIframeId) {
      // when in a resizable iframe, post message when page div changes height
      const resizeObserver = new ResizeObserver(entries => {
        entries.forEach(entry => {
          window.parent.postMessage({iframeId: autosizeIframeId, 
                                     height: `${entry.target.scrollHeight}px`}, '*');
        });
      });
      resizeObserver.observe(document.querySelector('div.page'));
    }

    // register service worker
    /*if (window.location.hostname !== "localhost") {
      const wb = new Workbox('/serviceworker.js');
      wb.addEventListener('waiting', () => serviceWorkerUpdateWaiting = true);
      try {
        await wb.register();
        console.log('Service worker successfully registered.');
        // periodically check for updates for long running sessions
        checkServiceWorkerIntervalId = window.setInterval(async () => {
            try {  
              await wb.update();
            } catch(e) {
              console.warn(`Error checking for service worker update ${e}`);
            }
          }, 60*60*1000);
      } catch(e) {
        console.warn(`Error registering service worker ${e}`);
      }
    }*/
    if (window.location.hostname !== "localhost") {
      const wb = new Workbox('/serviceworker.js');

      // Atualiza o store quando há uma nova versão esperando
      wb.addEventListener('waiting', () => {
        serviceWorkerUpdateWaiting.set(true);
      });

      try {
        await wb.register();
        console.log("Service worker registrado com sucesso.");

        // Verifica periodicamente por atualizações
        checkServiceWorkerIntervalId = window.setInterval(async () => {
          try {
            await wb.update();
          } catch (e) {
            console.warn(`Erro ao verificar atualização do Service Worker: ${e}`);
          }
        }, 60 * 60 * 1000);
      } catch (e) {
        console.warn(`Erro ao registrar Service Worker: ${e}`);
      }
    }

  });

  async function handleBeforePrint() {
    $activeCell = -1;
    if (document.activeElement instanceof HTMLElement) {
      document.activeElement.blur();
    }
    await tick();
  }

  function showTerms() {
    modalInfo = {
      modalOpen: true,
      state: "termsAndConditions",
      heading: "Termos e Condições"
    };
  }

  function showRequestPersistentStorage() {
    modalInfo = {
      modalOpen: true,
      state: "requestPersistentStorage",
      heading: "Enable Persistent Local Storage"
    };
  }

  async function acceptTerms() {
    if (termsAccepted < termsVersion) {
      termsAccepted = termsVersion;
      try {
          await set('termsAccepted', termsAccepted);
      } catch (e) {
          console.log(`Error updating termsAccepted entry: ${e}`);
      }
    }
  }


  function handleMotionPreferenceChange(event) {
    $prefersReducedMotion = event.matches;
  }

  function handleInsertMathCell(event: ComponentEvents<CellList>['insertMathCell']) {
    addCell('math', event.detail.index+1);
  }

  function handleInsertInsertCell(event: ComponentEvents<CellList>['insertInsertCells']) {
    $inCellInsertMode = true;
    addCell('insert', event.detail.index+1);
  }

  function handleCellModal(event: ComponentEvents<CellList>['modal']) {
    modalInfo = event.detail.modalInfo;
  }

  function handleKeyboardShortcuts(event: KeyboardEvent) {
    // this first switch statement is for keyboard shortcuts that should ignore defaultPrevented
    // since some components try to handle these particular events
    // probably would be better to catch these on the capture phase to prevent this issue
    switch (event.key) {
      case "ArrowDown":
        if (!event[$modifierKey] || modalInfo.modalOpen) {
          return;
        } else {
          incrementActiveCell();
          event.preventDefault();
        }
        break;
      case "ArrowUp":
        if (!event[$modifierKey] || modalInfo.modalOpen) {
          return;
        } else {
          decrementActiveCell();
          event.preventDefault();
        }
        break;
    }

    if (event.defaultPrevented) {
      return;
    }

    switch (event.key) {
      case "d":
      case "D":
        if (!event[$modifierKey] || modalInfo.modalOpen) {
          return;
        } else {
          if ($activeCell > -1 && $activeCell < $cells.length) {
            deleteCell($activeCell);
          }
        }
        break;
      case "o":
      case "O":
        if (!event[$modifierKey] || modalInfo.modalOpen) {
          return;
        } else {
          handleFileOpen();
        }
        break;
      case "n":
      case "N":
        if (!event[$modifierKey] || !event.shiftKey || modalInfo.modalOpen) {
          return;
        } else {
          loadBlankSheet();
        }
        break;
      case "l":
      case "L":
        if (!event[$modifierKey] || modalInfo.modalOpen) {
          return;
        } else {
          modalInfo = {
            state: "uploadSheet",
            modalOpen: true,
            heading: "Salvar com Link Compartilhável"
          };
        }
        break;
      case "s":
      case "S":
        if (!event[$modifierKey] || modalInfo.modalOpen) {
          return;
        } else if (event.shiftKey) {
          saveSheetToFile(true);
        } else {
          saveSheetToFile();
        }
        break;
      case "Esc":
      case "Escape":
        if ($inCellInsertMode) {
          const button = document.getElementById("insert-popup-button-esc");
          if (button) {
            button.click();
          }
          break;
        }
        $activeCell = -1;
        if (document.activeElement instanceof HTMLElement) {
          document.activeElement.blur();
        }
        modalInfo.modalOpen = false;
        sideNavOpen = false;
        fileDropActive = false;
        document.body.click();
        break;
      case "Enter":
        if ($activeCell < 0 && event.shiftKey && !modalInfo.modalOpen) {
          addCell('math', 0);
          break;
        } else if (event[$modifierKey] && !modalInfo.modalOpen) {
          if ($activeCell < 0 && !$inCellInsertMode ) {
            $inCellInsertMode = true;
            addCell('insert', 0);
            break;
          } else {
            // Ctrl-Enter when in cell insert mode
            // break to prevent default so that Ctrl-Enter doesn't click insert math cell button
            break;
          }
        } else {
          // there is already a cell selected, already handled directly by cell events
          return;
        }
      case "1":
      case "2":
      case "3":
      case "4":
      case "5":
      case "6":
      case "7":
      case "8":
      case "9":
        if ($inCellInsertMode) {
          const button = document.getElementById("insert-popup-button-" + event.key);
          if (button) {
            button.click();
          }
          break;
        } else {
          return;
        }
      default:
        return;
    }

    event.preventDefault();
  }

  function handleBeforeUnload(event) {
    if($unsavedChange && !inIframe){
      event.preventDefault();
      event.returnValue = '';
    } else {
      delete event['returnValue'];
    }
  } 


  // Função para obter o hash da URL
  function getSheetHash(url: Location | URL) {
    let hash = "";

    // Log para verificar se o hash está correto
    //console.log("URL Pathname:", url.pathname);
    //console.log("URL Hash:", url.hash);

    // First check if url hash could be sheet hash, if not check if path could a checkpoint or sheet hash
    if (url.hash.length === 23) {
      hash = url.hash.slice(1);
    } else if (url.pathname.slice(1).startsWith(checkpointPrefix) || url.pathname.length === 23) {
      hash = url.pathname.slice(1);
    }

    //console.log("Hash retornado:", hash); // Log para verificar o valor final do hash
    return hash;
  }

  async function handleSheetChange(event: PopStateEvent) {
    await refreshSheet();
  }

  function getFileHandleFromKey(fileKey: string | undefined): (null | FileSystemFileHandle) {
    if (fileKey) {
      const fileInfo = recentSheets.get(fileKey);
      if (fileInfo && "fileHandle" in fileInfo) {
        return fileInfo.fileHandle;
      } else {
        return null;
      }
    } else {
      return null;
    }
  }


  async function initializeBlankSheet() {
    currentStateObject = null;
    await resetSheet();
    await tick();
    addCell('math');
    await tick();
    $unsavedChange = false;
    $autosaveNeeded = false;
  }

  /*async function refreshSheet(firstTime = false) {
    if (!refreshingSheet) {
      refreshingSheet = true;

      const hash = getSheetHash(window.location);

      let searchParams: null | URLSearchParams = null;
      if (firstTime) {
        searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('autosize-iframe-id')) {
          autosizeIframeId = searchParams.get('autosize-iframe-id');
        }
      }

      if (!firstTime && window.location.hash !== "" && window.location.hash.length !== 23 && 
          `/${hash}` === currentState && window.history.state === null) {
        // Only hash fragment of URL has changed, don't need to do anything, let browser jump to ID
        // Without this check, sheet will reload on hash fragment change 
        window.history.replaceState(currentStateObject, "", currentState); // clear hash so that future clicks on hash fragment trigger this same check
      } else if (!$unsavedChange || window.confirm("Continuar carregando a planilha? Quaisquer alterações não salvas serão perdidas.")) {
        currentState = `/${hash}`;
        if (firstTime && ( window.location.pathname === "/open_file" || 
                           searchParams.get('activation') === "file") ) {
          modalInfo = {state: "opening", modalOpen: true, heading: "Abrindo Planilha"};
          await initializeBlankSheet();  // ensure minimal sheet is loaded in case file load fails or launch queue is empty
          window.history.replaceState(null, "", "/");
          if ('launchQueue' in window) {
            (window.launchQueue as any).setConsumer(launchParams => {
              if (!launchParams.files.length) {
                return;
              }
              const fileHandle = launchParams.files[0];
              openSheetFromFileHandle(fileHandle);
            });
          } else {
            modalInfo.modalOpen = false; // launchQueue not supported by browser, close file open modal
          }
        } else if (hash.startsWith(checkpointPrefix)) {
          currentStateObject = window.history.state;
          await restoreCheckpoint(hash);
        } else if(hash !== "") {
          currentStateObject = null;
          await loadSheetFromUrl(`${apiUrl}${API_GET_PATH}${hash}`);
        } else if(getFileHandleFromKey(window.history.state?.fileKey)) {
          // user had file open, restore that file
          currentStateObject = window.history.state;
          openSheetFromFileHandle(getFileHandleFromKey(window.history.state?.fileKey), false);
        } else {
          await initializeBlankSheet();
        }
      } else {
        // navigation cancelled, restore previous path
        window.history.replaceState(currentStateObject, "", currentState);
      }

      if (firstTime && searchParams.get("modal") === "terms") {
        window.history.replaceState(window.history.state, "", window.location.pathname)
        showTerms();
      }

      refreshingSheet = false;
    } else {
      // another refresh is already in progress
      // don't start a new one and reset the url path to match refresh already in progress
      window.history.replaceState(currentStateObject, "", currentState);
    }
  }*/

  async function refreshSheet(firstTime = false) {
    //console.log("Valor de refreshingSheet antes de chamar refreshSheet:", refreshingSheet);
    if (!refreshingSheet) {
      refreshingSheet = true;

      let hash = getSheetHash(window.location);

      let searchParams: null | URLSearchParams = null;
      if (firstTime) {
        searchParams = new URLSearchParams(window.location.search);
        if (searchParams.get('autosize-iframe-id')) {
          autosizeIframeId = searchParams.get('autosize-iframe-id');
        }
      }

      // Log para verificar o hash gerado
      const pathnameSegments = window.location.pathname.split('/');

      // Verifica se há ao menos um segmento válido
      if (pathnameSegments.length > 1 && pathnameSegments[1]) {
        hash = pathnameSegments[1];
      } else {
        // Caso não haja segmento após o domínio
        console.log("Default pathname");
        // Aqui você pode definir um valor padrão ou lançar um erro
      }

      //console.log("Hash gerado:", hash);

      if (
        !firstTime &&
        window.location.hash !== "" &&
        window.location.hash.length !== 23 &&
        `/${hash}` === currentState &&
        window.history.state === null
      ) {
        window.history.replaceState(currentStateObject, "", currentState);
      } else if (!$unsavedChange || window.confirm("Continuar carregando a planilha? Quaisquer alterações não salvas serão perdidas.")) {
        currentState = `/${hash}`;
        if (
          firstTime &&
          (window.location.pathname === "/open_file" || searchParams.get('activation') === "file")
        ) {
          modalInfo = { state: "opening", modalOpen: true, heading: "Abrindo Planilha" };
          await initializeBlankSheet();
          window.history.replaceState(null, "", "/");
          if ('launchQueue' in window) {
            (window.launchQueue as any).setConsumer((launchParams) => {
              if (!launchParams.files.length) {
                return;
              }
              const fileHandle = launchParams.files[0];
              openSheetFromFileHandle(fileHandle);
            });
          } else {
            modalInfo.modalOpen = false;
          }
        } else if (hash.startsWith(checkpointPrefix)) {
          currentStateObject = window.history.state;
          await restoreCheckpoint(hash);
        } else if (hash !== "") {
          currentStateObject = null;
          const fileUrl = `https://${"mctdbucketmemorial.s3.us-east-2.amazonaws.com"}/${hash}.json`;

          // Adicionando logs para verificar a URL e o hash
          console.log("Abrir link");
          console.log("Hash gerado:", hash);
          console.log("URL do arquivo a ser carregado:", fileUrl);

          try {
            await loadSheetFromUrl(fileUrl); // Carregando a planilha a partir da URL gerada
          } catch (error) {
            console.error("Erro ao carregar o arquivo:", error);
          }
        } else if (getFileHandleFromKey(window.history.state?.fileKey)) {
          currentStateObject = window.history.state;
          openSheetFromFileHandle(getFileHandleFromKey(window.history.state?.fileKey), false);
        } else {
          await initializeBlankSheet();
        }
      } else {
        window.history.replaceState(currentStateObject, "", currentState);
      }

      if (firstTime && searchParams.get("modal") === "terms") {
        window.history.replaceState(window.history.state, "", window.location.pathname);
        showTerms();
      }

      refreshingSheet = false;
    } else {
      window.history.replaceState(currentStateObject, "", currentState);
    }
  }

  function loadBlankSheet() {
    window.history.pushState(null, "", "/");
    refreshSheet(); // pushState does not trigger onpopstate event
  }

  function getResults(statementsAndSystems: string, myRefreshCount: BigInt, 
                      needCoolprop: Boolean, needNumpy: Boolean) {
    return new Promise<Results>((resolve, reject) => {
      function handleWorkerMessage(e) {
        forcePyodidePromiseRejection = null;
        if (e.data === "pyodide_not_available") {
          // pyodide didn't load properly
          reject("Pyodide failed to load.");
        } else if (e.data === "max_recursion_exceeded") {
          reject("Max recursion depth exceeded.")
        } else {
          if (!cache.has(statementsAndSystems)) {
            cache.set(statementsAndSystems, e.data);
          }
          if (myRefreshCount !== refreshCounter) {
            reject("Stale solution, resolving. If this message persists, make an edit to trigger a recalculation.");
          } else {
            resolve(e.data);
          }
        }
      }
      const cachedResult = cache.get(statementsAndSystems);
      if (cachedResult) {
        cacheHitCount++;
        resolve(cachedResult);
      } else {
        forcePyodidePromiseRejection = () => reject("Restarting pyodide.")
        pyodideWorker.onmessage = handleWorkerMessage;
        pyodideWorker.postMessage({cmd: 'sheet_solve', data: statementsAndSystems, needCoolprop, needNumpy});
      }
    });
  }

  function getStatementsAndSystemsForPython(): StatementsAndSystems {
    const statements: (Statement | SubQueryStatement)[] = [];
    const endStatements: (Statement | SubQueryStatement)[] = [];
    const subQueries: Map<string,SubQueryStatement> = new Map();
    const systemDefinitions: SystemDefinition[] = [];
    const fluidFunctions: FluidFunction[] = [];
    const interpolationFunctions: InterpolationFunction[] = [];

    for (const [cellNum, cell] of $cells.entries()) {
      if (cell instanceof MathCell) {
        if (cell.mathField.statement.type === "assignmentList") {
          statements.push(cell.mathField.statement.assignments[0]);
          endStatements.push(...cell.mathField.statement.assignments.slice(1));
        } else if (cell.mathField.statement.type === "query"){
          if ((cell.config && cell.config.showIntermediateResults) || 
              $config.mathCellConfig.showIntermediateResults) {
            if ("subQueries" in cell.mathField.statement) {
              for (const subQuery of cell.mathField.statement.subQueries) {
                subQueries.set(subQuery.sympy, subQuery);
              }
            }
          }
          statements.push(cell.mathField.statement);
          if (cell.mathField.statement.assignment) {
            endStatements.push(cell.mathField.statement.assignment);
          }
        } else {
          statements.push(cell.mathField.statement);
        }
      } else if (cell instanceof PlotCell) {
        for (const mathField of cell.mathFields) {
          if (mathField.statement.type === "parametricRange") {
            endStatements.push(...mathField.statement.assignmentStatements);
            for (const parametricStatement of mathField.statement.rangeQueryStatements) {
              parametricStatement.cellNum = cellNum;
              statements.push(parametricStatement);
            }
          } else { 
            if ( (mathField.statement.type === "query" && mathField.statement.isRange) ||
                  mathField.statement.type === "scatterQuery") {
              mathField.statement.cellNum = cellNum;
            }
            statements.push(mathField.statement);
          }
        }
      } else if (cell instanceof TableCell) {
        endStatements.push(...cell.tableStatements);
      } else if (cell instanceof DataTableCell) {
        let queryCount = 0;
        for (const [i, statement] of cell.columnStatements.entries()) {
          if (statement) {
            if (statement.type === "query") {
              if (statement.isDataTableQuery) {
                statement.cellNum = cellNum
                statement.colNum = i;
                statements.push(statement);
                queryCount++;
              }
              if (statement.assignment) {
                endStatements.push(statement.assignment);
              }
            } else {
              endStatements.push(statement);
            }
          }
        }
        if (queryCount === 0) {
          // no queries, need placeholder statement
          statements.push(getBlankStatement());
        }
        interpolationFunctions.push(...cell.interpolationFunctions);
      } else if (cell instanceof PiecewiseCell) {
        if (cell.piecewiseStatement) {
          endStatements.push(cell.piecewiseStatement);
        }
      } else if (cell instanceof SystemCell) {
        const systemDefinition = cell.getSystemDefinition();
        if (systemDefinition) {
          systemDefinitions.push(systemDefinition);
        }
      } else if (cell instanceof FluidCell) {
        const {fluidFunction, statement} = cell.getFluidFunction($config.fluidConfig);
        if (fluidFunction) {
          fluidFunctions.push(fluidFunction);
          if (statement) {
            endStatements.push(statement);
          }
        }
      }
    }

    if (subQueries.size > 0) {
      endStatements.push(...subQueries.values());
    }

    statements.push(...endStatements);

    return {
      statements: statements,
      systemDefinitions: systemDefinitions,
      fluidFunctions: fluidFunctions,
      interpolationFunctions: interpolationFunctions,
      customBaseUnits: $config.customBaseUnits,
      simplifySymbolicExpressions: $config.simplifySymbolicExpressions,
      convertFloatsToFractions: $config.convertFloatsToFractions
    };
  }

  function checkParsingErrors() {
    return $cells.reduce(parsingErrorReducer, false)
  }

  function parsingErrorReducer(acum: boolean, cell: Cell) {
    if (cell instanceof MathCell) {
      return acum || cell.mathField.parsingError;
    } else if (cell instanceof PlotCell) {
      return acum || cell.mathFields.some(field => field.parsingError);
    } else if (cell instanceof TableCell) {
      return acum || cell.parameterFields.some(value => value.parsingError) ||
                     cell.parameterUnitFields.some(value => value.parsingError) ||
                     cell.rhsFields.reduce((accum, row) => accum || row.some(value => value.parsingError), false);
    } else if (cell instanceof PiecewiseCell) {
      return acum || cell.parameterField.parsingError || 
                     cell.expressionFields.some(value => value.parsingError) ||
                     cell.conditionFields.some(value => value.parsingError);
    } else if (cell instanceof SystemCell) {
      return acum || cell.parameterListField.parsingError || 
                     cell.expressionFields.some(value => value.parsingError);
    } else if (cell instanceof FluidCell) {
      return acum || cell.error;
    } else if (cell instanceof DataTableCell) {
      return acum || cell.parameterFields.some(value => value.parsingError) ||
                     cell.parameterUnitFields.some(value => value.parsingError);
    } else {
      return acum || false;
    }
  }

  async function handleCellUpdate(localRefreshCounter: BigInt) {
    if (localRefreshCounter !== refreshCounter) {
      return;
    }
    const myRefreshCount = localRefreshCounter;
    const firstRunAfterSheetLoad = initialSheetLoad;
    initialSheetLoad = false;
    inDebounce = false;
    if(noParsingErrors && !firstRunAfterSheetLoad) {
      // invalidate results if all math fields are valid (while editing current cell)
      // also, don't invalidate results if sheet was just loaded without modification (initialSheetLoad === true)
      $resultsInvalid = true;
      error = "";
    }
    await pyodidePromise;
    pyodideTimeout = false;
    if (myRefreshCount === refreshCounter && noParsingErrors) {
      const statementsAndSystemsObject = getStatementsAndSystemsForPython()
      let statementsAndSystems = JSON.stringify(statementsAndSystemsObject);
      clearTimeout(pyodideTimeoutRef);
      pyodideTimeoutRef = window.setTimeout(() => pyodideTimeout=true, pyodideTimeoutLength);
      if (!firstRunAfterSheetLoad) {
        $resultsInvalid = true;
        error = "";
      }
      pyodidePromise = getResults(statementsAndSystems,
                                  myRefreshCount, 
                                  Boolean(statementsAndSystemsObject.fluidFunctions.length > 0),
                                  Boolean(statementsAndSystemsObject.interpolationFunctions.length > 0))
      .then((data: Results) => {
        $results = [];
        $resultsInvalid = false;
        $sub_results = new Map();
        if (!data.error && data.results.length > 0) {
          let counter = 0;
          for (const [i, cell] of $cells.entries()) {
            if ((cell.type === "math" || cell.type === "plot" || cell.type === "dataTable") ) {
              $results[i] = data.results[counter++];
            } else {
              $results[i] = null;
            }
          }
          while(counter < data.results.length) {
            const currentResult = data.results[counter++];
            if ("isSubResult" in currentResult && currentResult.isSubResult) {
              $sub_results.set(currentResult.subQueryName, currentResult);
            }
          }
        }
        error = data.error;
        $system_results = [];
        let counter = 0;
        for (const [i, cell] of $cells.entries()) {
          if (cell.type === "system") {
            $system_results[i] = data.systemResults[counter++]
          } else {
            $system_results[i] = null;
          }
        }
        if (!firstRunAfterSheetLoad) {
          $autosaveNeeded = true;
        }
      })
      .catch((errorMessage) => error=errorMessage);
    }
  }

  const debounceHandleCellUpdate = debounce(handleCellUpdate, 300);

  async function restartPyodide() {
    // reject any pending promise and restart webworker
    if (forcePyodidePromiseRejection) {
      forcePyodidePromiseRejection();
    }
    await pyodidePromise;
    terminateWorker();
    startWebWorker();
    $results = [];
    $system_results = [];
    $sub_results = new Map();
    refreshCounter++; // make all pending updates stale
  }

  /*async function uploadSheet(resultModal = true): Promise<string> {
    modalInfo.state = "uploadPending";
    const data = getSheetJson();
    const hash = await getHash(data);

    let response, responseObject;

    try {
      const body: SheetPostBody = {
        title: $title, 
        history: $history,
        document: data.slice(1)
      };

      response = await fetch(`${apiUrl}${API_SAVE_PATH}${hash}`, {
        method: "POST",
        headers: new Headers({"Content-Type": "application/json"}),
        body: JSON.stringify(body)
      });

      if (response.ok) {
         responseObject = await response.json();
      } else {
        if (response.status === 413) {
          throw new Error('Sheet too large for database, reduce size of images and try to resubmit. Height and width of any images should be 800 pixels or less.');
        } else {
          throw new Error(`${response.status} ${await response.text()}`);
        }
      }

      if (getSheetHash(window.location) !== responseObject.hash) {
        currentState = `/${responseObject.hash}`;
        currentStateObject = null;
        window.history.pushState(null, "", currentState);
      }

      console.log(responseObject.url);

      const sheetUrl = window.location.href;

      if (resultModal) {
        modalInfo = {
          state: "success",
          url: sheetUrl,
          modalOpen: true,
          heading: modalInfo.heading
        };
      }

      $unsavedChange = false;
      $autosaveNeeded = false;

      $history = responseObject.history;

      // on successful upload, update recent sheets
      await updateRecentSheets( { url: sheetUrl, title: $title, sheetId: $sheetId } );

      return sheetUrl;
    } catch (error) {
      console.log("Error sharing sheet:", error);

      if (resultModal) {
        modalInfo = {
          state: "error",
          error: error,
          modalOpen: true,
          heading: modalInfo.heading};
      }

      return "";
    }
  }*/

  async function uploadSheet(resultModal = true): Promise<string> {
    modalInfo.state = "uploadPending";
    const data = getSheetJson();
    const hash = await getHash(data);

    const bucketName = "mctdbucketmemorial";
    const region = "us-east-2";
    const fileName = `${hash}.json`;
    //const fileUrl = `https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`;
    //const fileUrl = `https://boscolab.vercel.app/${fileName}`;
    const fileNameWithoutExtension = fileName.replace('.json', ''); 
    const fileUrl = `https://boscolab.vercel.app/${fileNameWithoutExtension}`;

    try {
      // Configuração do corpo do upload
      //const body: SheetPostBody = {
      //  title: $title, 
      //  history: $history,
      //  document: data.slice(1)
      //};

      //console.log('data: ', data);
      //console.log('data.slice(1): ', data.slice(1));
      //console.log('body: ', JSON.stringify(body));

      const body: Blob = new Blob([JSON.stringify({
        title: $title,
        history: $history,
        document: data.slice(1)
      })], { type: "application/json" });

      // Upload do arquivo para o bucket S3
      const response = await fetch(`https://${bucketName}.s3.${region}.amazonaws.com/${fileName}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          //"x-amz-acl": "public-read" // Tornar o arquivo público para compartilhamento
        },
        //body: JSON.stringify(body)
        body: body
      });

      if (!response.ok) {
        throw new Error(`Erro ao enviar o arquivo para o S3: ${response.status} ${await response.text()}`);
      }

      // Atualizar o estado e histórico
      if (getSheetHash(window.location) !== hash) {
        currentState = `/${hash}`;
        currentStateObject = null;
        window.history.pushState(null, "", currentState);
      }

      //console.log(fileUrl);

      if (resultModal) {
        modalInfo = {
          state: "success",
          url: fileUrl,
          modalOpen: true,
          heading: modalInfo.heading
        };
      }

      $unsavedChange = false;
      $autosaveNeeded = false;

      $history = $history; // Preserva o histórico

      // Atualizar as planilhas recentes
      await updateRecentSheets({ url: fileUrl, title: $title, sheetId: $sheetId });
      
      return fileUrl;
    } catch (error) {
      //console.error("Erro ao compartilhar a planilha:", error);
      if (resultModal) {
        modalInfo = {
          state: "error",
          error: error,
          modalOpen: true,
          heading: modalInfo.heading
        };
      }

      return "";
    }
  }

  async function downloadSheet(url: string):
                              Promise<{ sheet: Sheet; requestHistory: History; } | null> {
    modalInfo = {state: "retrieving", modalOpen: true, heading: "Carregando Planilha"};

    let sheet: Sheet, requestHistory: History;
    
    try{
      let response;
      response = await fetch(url);
      //console.log("downloadSheet: ", url);
      if (response.ok) {
        const responseObject = await response.json();
        //console.log("responseObject: ", JSON.stringify(responseObject));        
        sheet = JSON.parse(responseObject.document) as Sheet;        
        requestHistory = responseObject.history as History;
      } else {
        throw new Error(`${response.status} ${await response.text()}`);
      }
    } catch(error) {
      modalInfo = {
          state: "error",
          error: `
              <p>
                  Não foi possível carregar a planilha localizada em <strong>${window.location}</strong>. 
                  Isso pode ter ocorrido devido a uma URL incorreta, problemas temporários no servidor, 
                  ou uma falha de conexão. 
              </p>
              <p>
                  Se o problema persistir, entre em contato com nossa equipe de suporte através do e-mail 
                  <a href="mailto:suporte@boscolab.com.br?subject=Erro ao Recuperar Planilha&body=Planilha que falhou ao carregar: ${encodeURIComponent(window.location.href)}" aria-label="Enviar e-mail para suporte técnico sobre erro no carregamento da planilha">
                      @engjango
                  </a>. 
                  Inclua o link para esta planilha no e-mail para ajudar na análise e resolução do problema.
              </p>
              <p>
                  Detalhes técnicos do erro: <code>${error}</code>
              </p>
          `,
          modalOpen: true,
          heading: "Erro ao Carregar Planilha"
      };
      return null;
    }

    return { sheet: sheet, requestHistory: requestHistory };
  }


  async function loadSheetFromUrl(url: string) {
    //console.log("loadSheetFromUrl: ", url);
    const sheetData = await downloadSheet(url);

    if (!sheetData) {
      return; // error downloading sheet, downloadSheet function already displayed error modal
    }

    const { sheet, requestHistory } = sheetData;

    const renderError = await populatePage(sheet, requestHistory);

    if (renderError) {
      modalInfo = {
          state: "error",
          error: `
              <p>
                  Não foi possível carregar a planilha localizada em <strong>${window.location}</strong>. 
                  Isso pode ter ocorrido devido a uma URL incorreta, problemas temporários no servidor, 
                  ou uma falha de conexão. 
              </p>
              <p>
                  Se o problema persistir, entre em contato com nossa equipe de suporte através do e-mail 
                  <a href="mailto:suporte@boscolab.com.br?subject=Erro ao Recuperar Planilha&body=Planilha que falhou ao carregar: ${encodeURIComponent(window.location.href)}" aria-label="Enviar e-mail para suporte técnico sobre erro no carregamento da planilha">
                      @engjango
                  </a>. 
                  Inclua o link para esta planilha no e-mail para ajudar na análise e resolução do problema.
              </p>
              <p>
                  Detalhes técnicos do erro: <code>${error}</code>
              </p>
          `,
          modalOpen: true,
          heading: "Erro ao Carregar Planilha"
      };  
      $cells = [];
      $unsavedChange = false;
      $autosaveNeeded = false;
      return;
    }

    modalInfo.modalOpen = false;

    $unsavedChange = false;
    $autosaveNeeded = false;

    // on successfull sheet download, update recent sheets list
    await updateRecentSheets( { url: window.location.href, title: $title, sheetId: $sheetId } );
  }

  async function populatePage(sheet: Sheet, requestHistory: History): Promise<boolean> {
    if (populatingPage) {
      // populatePage already in progress, error out so current process can finish
      return true;
    }

    try{
      populatingPage = true;
      initialSheetLoad = true;

      $cells = [];
      $results = [];
      $resultsInvalid = true;
      $system_results = [];
      $sub_results = new Map();
      $activeCell = -1;

      await tick();

      $title = sheet.title;
      BaseCell.nextId = sheet.nextId;
      $sheetId = sheet.sheetId;
      // old documents in database will not have the insertedSheets property
      $insertedSheets = sheet.insertedSheets ?? [];
      $config = normalizeConfig(sheet.config);

      $cells = await Promise.all(sheet.cells.map((value) => cellFactory(value, $config)));

      if (!$history.map(item => item.hash !== "file" ? getSheetHash(new URL(item.url)) : "").includes(getSheetHash(window.location))) {
        $history = requestHistory;
      }

      await tick(); // this will populate mathFieldElement and richTextInstance fields

      if (noParsingErrors) {
        $results = sheet.results;
        $resultsInvalid = false;
        // old documents in the database won't have the system_results or sub_results properties
        $system_results = sheet.system_results ? sheet.system_results : [];
        $sub_results = sheet.sub_results ? new Map(sheet.sub_results) : new Map();
      } else {
        $results = [];
        $resultsInvalid = true;
        $system_results = [];
        $sub_results = new Map();
      }

    } catch(error) {
      console.warn(`Render Error: ${error}`);
      populatingPage = false;
      return true;
    }

    populatingPage = false;
    return false;
  }

  // open sheet using a input of type file
  async function handleFileOpen() {
    if (window.showOpenFilePicker) {
      // browser supports File System Access API
      const currentFileHandle = getFileHandleFromKey(window.history.state?.fileKey);

      // @ts-ignore
      let options: OpenFilePickerOptions = { types: fileTypes, id: "blab"};

      if (currentFileHandle) {
        // @ts-ignore
        options.startIn = currentFileHandle
      }

      let openFileHandle: FileSystemFileHandle;
      try {
        [openFileHandle] = await window.showOpenFilePicker(options);
      } catch(e) {
        // user cancelled file open
        console.log('File open cancelled.');
        return;
      }

      openSheetFromFile(await openFileHandle.getFile(), openFileHandle);

    } else {
      // no File System Access API, fall back to using input element
      const input = document.createElement("input");
      input.type = "file";
      input.accept = ".blab";
      input.onchange = (event) => openSheetFromFile(input.files[0], null);
      input.click();
    }
  }

  // open sheet from a drop event
  async function handleFileDrop(event: DragEvent) {
    fileDropActive = false;
    let file: File | null;
    let openFileHandle: null | FileSystemHandle

    const fileItems = Array.from(event.dataTransfer.items).filter(item => item.kind === "file");

    if (fileItems.length > 0 &&
        fileItems[0].getAsFileSystemHandle) {
      // browser supports file system access API
      openFileHandle = await fileItems[0].getAsFileSystemHandle();
      if (openFileHandle.kind === "file") {
        file = await (openFileHandle as FileSystemFileHandle).getFile();
      } else {
        // it's a directory, set file to null so that it is not opened (same as dropping any non-file object)
        file = null;
        openFileHandle = null;
      }
    } else {
      file = event.dataTransfer.files[0];
    }

    if (file) {
      if (DataTableCell.spreadsheetExtensions.includes(file.name.split('.').slice(-1)[0])) {
        // dropped a spreadsheet, add a data table cell to the end of the document
        modalInfo = {
    state: "importingSpreadsheet",
    modalOpen: true,
    heading: "Importando Planilha"
};

        await tick();

        await DataTableCell.init();
        const newDataTableCell = new DataTableCell();
        try {
          await newDataTableCell.loadFile(file);
        } catch (e) {
          modalInfo = {
    state: "error",
    error: `Erro ao importar o arquivo da planilha: ${e}`,
    modalOpen: true,
    heading: "Importando Planilha"
};

          return;
        }
        
        modalInfo.modalOpen = false;

        $cells = [...$cells, newDataTableCell];
        const newCellIndex = $cells.length - 1;
        await tick();
        const inputElement = document.getElementById(`data-table-input-${newCellIndex}-0-0`);
        if (inputElement) {
          // focus table so it scrolls into view since it will be placed at the end of the sheet
          inputElement.focus();
        }
      } else {
        if (openFileHandle) {
          openSheetFromFile(file, (openFileHandle as FileSystemFileHandle));
        } else {
          openSheetFromFile(file, null);
        }
      }
    } else if (event.dataTransfer.getData('text/plain')) {
      let droppedURL: URL | null;
      try {
        droppedURL = new URL(event.dataTransfer.getData('text/plain'));
      } catch (e) {
        droppedURL = null;
      }
      // It's not a file, check if it's a url from the same origin. If so, navigate to it to open the sheet
      if (droppedURL && droppedURL.origin === window.location.origin) {
        window.history.pushState(null, "", droppedURL);
        refreshSheet();
      }
    }
  }

  async function openSheetFromFileHandle(fileHandle: FileSystemFileHandle, pushState = true) {
    try {
      await fileHandle.requestPermission();
      openSheetFromFile(await fileHandle.getFile(), fileHandle, pushState)
    } catch(e) {
      modalInfo = {
    state: "error",
    error: `Erro ao Abrir o Arquivo. O arquivo pode não existir mais ou o navegador pode estar limitando o acesso a arquivos de sessões anteriores. 
    Será necessário reabrir o arquivo a partir de sua localização original.`,
    modalOpen: true,
    heading: "Abrindo Arquivo"
};
    }
  }


  function openSheetFromFile(file: File, fileHandle: null | FileSystemFileHandle, pushState = true) {
    if (file.size > 0) {
      modalInfo = {state: "opening", modalOpen: true, heading: "Abrindo Planilha"};
      const reader = new FileReader();
      reader.onload = (event) => loadSheetFromFile(event, fileHandle, pushState);
      reader.readAsText(file);
    } else {
      modalInfo = {
          state: "error",
          error: `Erro ao Abrir o Arquivo. Verifique se você selecionou um arquivo válido do Boscolab.`,
          modalOpen: true,
          heading: "Abrindo Arquivo"
      };
    } 
  }

  async function parseFile(event: ProgressEvent<FileReader>):
                 Promise<{ sheet: Sheet; requestHistory: History; } | null> {
    let sheet: Sheet, requestHistory: History;
    
    try{
      const fileObject = JSON.parse((event.target.result as string));
      if (fileObject.data && fileObject.history) {
        sheet = fileObject.data as Sheet;
        requestHistory = fileObject.history as History;
      } else {
        throw `File is not the correct format`;
      }

    } catch(error) {
      modalInfo = {
          state: "error",
          error: `<p>${error} <br><br>
              Ocorreu um erro ao processar o arquivo de entrada. Certifique-se de que está tentando abrir um arquivo do Boscolab.
          <br><br>
          Caso o problema persista após verificar que o arquivo é um arquivo do Boscolab, 
          envie um e-mail para <a href="mailto:suporte@boscolab.com.br">suporte@boscolab.com.br</a>. 
          Se possível, por favor, anexe o arquivo que não está abrindo.</p>`,
          modalOpen: true,
          heading: "Abrindo Planilha"
      };
      return null;
    }

    return { sheet: sheet, requestHistory: requestHistory };
  }

  async function loadSheetFromFile(event: ProgressEvent<FileReader>, fileHandle: null | FileSystemFileHandle, pushState = true) {
    const fileData = await parseFile(event);
    
    if (!fileData) {
      // error reading file, parseFile has already put up the error modal
      return;
    }

    const { sheet, requestHistory } = fileData;

    const renderError = await populatePage(sheet, requestHistory);

    if (renderError) {
      modalInfo = {
          state: "error",
          error: `<p>Erro ao restaurar o arquivo. <br><br>
              Ocorreu um erro ao processar o arquivo de entrada. Certifique-se de que está tentando abrir um arquivo do Boscolab.
          <br><br>
          Caso o problema persista após verificar que o arquivo é de fato um arquivo do Boscolab, 
          envie um e-mail para <a href="mailto:suporte@boscolab.com.br">suporte@boscolab.com.br</a>, 
          anexando, se possível, o arquivo que não está abrindo.</p>`,
          modalOpen: true,
          heading: "Restaurando Planilha"
      };

      $cells = [];
      $unsavedChange = false;
      $autosaveNeeded = false;
      return;
    }

    if (pushState) {
      currentState = '/';
      currentStateObject = Boolean(fileHandle) ? {fileKey: fileHandle.name + $title + $sheetId} : null
      window.history.pushState(currentStateObject, "", currentState);
    }

    modalInfo.modalOpen = false;
    $unsavedChange = false;
    $autosaveNeeded = true; // make a checkpoint so that, if user refreshes browser, the file is restored

    if (fileHandle) {
      await updateRecentSheets( {url: "", title: $title, sheetId: $sheetId, fileHandle: fileHandle } );
    }
  }


  async function restoreCheckpoint(hash: string) {
    modalInfo = {state: "restoring", modalOpen: true, heading: "Restaurando Planilha"};

    let sheet: Sheet, requestHistory: History;
    
    try{
      const checkpoint = await get(hash);
      if (checkpoint) {
        sheet = checkpoint.data as Sheet;
        requestHistory = checkpoint.history as History;
      } else {
        throw `Checkpoint de salvamento automático ('${hash}') não encontrado neste dispositivo.`;
      }
    } catch(error) {
      modalInfo = {
    state: "error",
    error: `<p>${error}. <br><br>
    Caso alguém tenha compartilhado este link com você, solicite que a pessoa crie um link compartilhável para que você possa acessar a planilha. Links de checkpoint, como este, podem ser abertos apenas no computador e no navegador onde foram originalmente gerados.
    <br><br>
    Existem diversas causas possíveis para esse erro.
    Os checkpoints de salvamento automático são armazenados localmente no navegador em uso. Esses checkpoints não são permanentes e podem ser excluídos pelo navegador para liberar espaço. O Boscolab reterá apenas os ${numCheckpoints} checkpoints mais recentes.
    Alguns navegadores, como o Safari, excluem automaticamente o armazenamento local do navegador para sites que não foram visitados nos últimos 7 dias. Para solicitar que seu navegador mantenha o armazenamento utilizado pelo Boscolab, ative a opção "Habilitar Armazenamento Local Persistente" no menu à esquerda. 
    </p>`,
        modalOpen: true,
        heading: "Restaurando Planilha"
    };
      return;
    }

    const renderError = await populatePage(sheet, requestHistory);

    if (renderError) {
      modalInfo = {
    state: "error",
    error: `<p>Erro ao restaurar o checkpoint de salvamento automático ${window.location}.
      Este problema provavelmente é causado por um erro no Boscolab.
      Caso o problema persista após tentar atualizar a página, por favor, reporte o incidente para
      <a href="mailto:suporte@boscolab.com.br?subject=Erro ao Regenerar Planilha&body=Planilha que não foi carregada: ${encodeURIComponent(window.location.href)}">suporte@boscolab.com.br</a>.
      Inclua um link para a planilha no e-mail, a fim de ajudar na investigação e resolução do problema. </p>`,
          modalOpen: true,
          heading: "Restaurando Planilha"
      };

      $cells = [];
      $unsavedChange = false;
      $autosaveNeeded = false;
      return;
    }

    modalInfo.modalOpen = false;
    $unsavedChange = false;
    $autosaveNeeded = false;
  }


  function loadInsertSheetModal(e: {detail: {index: number}} ) {
    retrieveRecentSheets();

    modalInfo = {
      modalOpen: true,
      state: "insertSheet",
      heading: "Inserir uma Planilha",
      url: "",
      insertionLocation: e.detail.index
    };
  }

  function loadCellNumberFormatModal(e: any) {
    modalInfo = {
      modalOpen: true,
      state: "sheetSettings",
      heading: "Opções de formatação numérica da célula",
      mathCell: e.detail.mathCell as MathCell,
      mathCellElement: e.detail.target as MathCellElement
    };
  }

  function loadGenerateCodeModal(e: any) {
    modalInfo = {
      modalOpen: true,
      state: "generateCode",
      heading: "Gerar Código da Função",
      codeGenerationIndex: e.detail.index
    };
  }

  function loadSaveSheetModal(e: any) {
    modalInfo = {
      modalOpen: true,
      state: "downloadDocument",
      heading: "Salvar Arquivo",
    };
  }

  function handleInsertSheetFromFile(e: CustomEvent<{file: File}>) {
    if (e.detail.file.size > 0) {
      modalInfo.state = "opening";
      modalInfo.modalOpen = true;
      modalInfo.heading = "Abrindo Arquivo";

      const reader = new FileReader();
      reader.onload = insertSheet;
      reader.readAsText(e.detail.file); 
    } else {
      modalInfo = {
        state: "error",
        error: `Não foi possível abrir o arquivo.`,
        modalOpen: true,
        heading: "Abrir Arquivo"
      };
    }
  }

  async function insertSheet(fileReader?: ProgressEvent<FileReader>) {
    const index = modalInfo.insertionLocation;

    let sheetData: { sheet: Sheet; requestHistory: History; } | null;
    let sheetUrl: string;

    if(fileReader) {
      sheetData = await parseFile(fileReader);
      sheetUrl = "file";
    } else {
      sheetUrl = modalInfo.url;
      let sheetHash: string;

      try {
        sheetHash = getSheetHash(new URL(sheetUrl));
        if (sheetHash === "") {
          throw new Error(`${sheetUrl} is not a valid Boscolab sheet URL.`);
        }
      } catch(error) {
        modalInfo = {
          state: "error",
          error: `<p>Error inserting sheet "${sheetUrl ? sheetUrl : 'empty URL'}". The URL is not valid Boscolab sheet.`,
          modalOpen: true,
          heading: "Retrieving Sheet"
        };
        return;
      }
      
      const url = `${apiUrl}${API_GET_PATH}${sheetHash}`;

      sheetData = await downloadSheet(url);
    }

    if (!sheetData) {
      return; // error downloading or opening sheet, downloadSheet or parseFile function already displayed error modal
    }

    const { sheet } = sheetData;

    try{
      $results = [];
      $resultsInvalid = true;
      $system_results = [];
      $sub_results = new Map();

      const newCells = await Promise.all(sheet.cells.map((value) => cellFactory(value, $config)));

      // need to make sure cell id's don't collide
      for (const cell of newCells) {
        cell.id = BaseCell.nextId++;
      }

      $cells = [...$cells.slice(0, index), ...newCells, ...$cells.slice(index)]

      await tick();
    } catch(error) {
      modalInfo = {
        state: "error",
        error: `<p>Error inserting sheet ${sheetUrl}.
This is most likely due to a bug in Boscolab.
If problem persists after attempting to refresh the page, please report problem to
<a href="mailto:suporte@boscolab.com.br?subject=Error Regenerating Sheet&body=Sheet that failed to load: ${encodeURIComponent(sheetUrl)}">suporte@boscolab.com.br</a>.  
Please include a link to this sheet in the email to assist in debugging the problem. <br>${error} </p>`,
        modalOpen: true,
        heading: "Retrieving Sheet"
      };
      $cells = [];
      $unsavedChange = false;
      $autosaveNeeded = false;
      return;
    }

    modalInfo.modalOpen = false;
    $unsavedChange = true;
    $autosaveNeeded = true;

    $insertedSheets = [
      {
        title: sheet.title,
        url: sheetUrl,
        insertion: new Date()
      }, 
      ...$insertedSheets
    ];

    if (index <= $cells.length-1) {
      $activeCell = index;
    }
  }


  // Save using a download anchor element
  // Will be saved to users downloads folder
  async function saveSheetToFile(saveAs = false) {
    $history = [{
      url: $title,
      hash: 'file',
      creation: (new Date()).toISOString()
    }, ...$history];

    const sheet = {
        data: getSheetObject(true),
        history: $history
    };

    const fileData = new Blob([JSON.stringify(sheet)], {type: "application/json"});

    if (window.showSaveFilePicker) {
      // browser supports file system access API, so show user a file picker
      let fileSaved = false;
      let saveFileHandle: FileSystemFileHandle;

      // use current file handle if user has already saved this sheet
      const currentFileHandle = getFileHandleFromKey(window.history.state?.fileKey);
      if (!saveAs && currentFileHandle && window.history.state?.fileKey ===  currentFileHandle.name + $title + $sheetId) {
        modalInfo = {state: "saving", modalOpen: true, heading: "Salvando Arquivo"};
        try {
          const writable = await currentFileHandle.createWritable();
          await writable.write(fileData);
          await writable.close();

          await sleep(250); // prevent save modal from flashing too quickly

          saveFileHandle = currentFileHandle;
          fileSaved = true;
        } catch(e) {
          // save using existing handle unsuccessful, will proceed to using the save dialog
          modalInfo.modalOpen = false;
        }
      }

      if (!fileSaved) {
        const options: SaveFilePickerOptions = {
          types: fileTypes,
          // @ts-ignore
          id: "blab",
          suggestedName: `${$title}.blab`
        }
        
        try {
          saveFileHandle = await window.showSaveFilePicker(options);
        } catch(e) {
          // user cancelled the save operation
          console.log('Save cancelled.');
          return;
        }

        modalInfo = {state: "saving", modalOpen: true, heading: "Salvando Arquivo"};
        try {
          const writable = await saveFileHandle.createWritable();
          await writable.write(fileData);
          await writable.close();
        } catch(e) {
          //save failed
          modalInfo = {
            state: "error",
            error: `<p>Erro ao salvar planilha: ${saveFileHandle.name} </p><br>
                    <p>${e}</p`,
            modalOpen: true,
            heading: "Salvando Planilha"
          };
          return;
        }
      }

      modalInfo.modalOpen = false;
      currentState = "/";
      currentStateObject = {fileKey: saveFileHandle.name + $title + $sheetId};
      window.history.pushState(currentStateObject, "", "/");

      await updateRecentSheets( {url: "", title: $title, sheetId: $sheetId, fileHandle: saveFileHandle } );
    } else {
      // browser does not support file system access API, file will be downloaded with default name
      saveFileBlob(fileData, `${$title}.blab`);
    }

    $unsavedChange = false;
    $autosaveNeeded = false;
  }


  async function saveLocalCheckpoint() {
    if ($autosaveNeeded && !refreshingSheet && !inIframe) {
      const autosaveHash = `${checkpointPrefix}${crypto.randomUUID()}`;
      let saveFailed = false;

      const checkpoint = {
        data: getSheetObject(true),
        history: $history
      }

      const checkpointInfo = {
        hash: autosaveHash,
        sheetId: $sheetId,
        title: $title,
        saveTime: new Date() 
      }

      // save the checkpoint
      try {
        await set(autosaveHash, checkpoint);
        currentState = `/${autosaveHash}`
        currentStateObject = window.history.state;
        window.history.pushState(currentStateObject, "", currentState);
        $autosaveNeeded = false;
      } catch(e) {
        console.log(`Erro ao salvar ponto de auto-salvamento local: ${e}`);
        saveFailed = true;
      }

      // update checkpoint list
      if (!saveFailed) {
        try {
          await update('checkpoints', (checkpoints) => {
            if (checkpoints) {
              checkpoints.push(checkpointInfo);
              return checkpoints;
            } else {
              return [checkpointInfo, ];
            }
          });
        } catch(e) {
          console.log(`Error updating checkpoint list: ${e}`);
        }
      }

      // delete old checkpoints if over maxCheckpoints
      let checkpoints = [];
      try {
        const tempCheckpoints = await get('checkpoints');
        if (tempCheckpoints) {
          checkpoints = tempCheckpoints;
        }
      } catch(e) {
        console.log(`Error retrieving checkpoint list: ${e}`);
      }

      let reduceNumCheckpoints = false;
      if (saveFailed) {
        // failed save likely due to no more space avialable
        // drop number of checkpoints so that the next autosave has a chance of succeeding
        numCheckpoints = Math.max(checkpoints.length - decrementNumCheckpoints, minNumCheckpoints);
        reduceNumCheckpoints = true;
      }

      if (checkpoints.length > numCheckpoints) {
        const hashesToRemove = checkpoints.slice(0, checkpoints.length-numCheckpoints).map( (entry) => entry.hash);
        try {
          await delMany(hashesToRemove);
          await set('checkpoints', checkpoints.slice(checkpoints.length-numCheckpoints));
        } catch(e) {
          console.log(`Error deleting old checkpoints: ${e}`);
        }
      }

      if (reduceNumCheckpoints) {
        try {
          await set('numCheckpoints', numCheckpoints);
        } catch(e) {
          console.log(`Error updated numCheckpoints: ${e}`)
        }
      }
    }
  }


  async function updateRecentSheets({url, title, sheetId, fileHandle} : 
      {url: string, title: string, sheetId: string, fileHandle?: FileSystemFileHandle}) {
    if (!inIframe) {

      let newRecentSheet: RecentSheetUrl | RecentSheetFile;
      let newKey: string;

      if (fileHandle) {
        newKey = fileHandle.name + title + sheetId;
        newRecentSheet = {
            fileName: fileHandle.name,
            fileHandle: fileHandle,
            accessTime: new Date(),
            title: title
          };
      } else {
        newKey = title + sheetId;
        newRecentSheet = {
            url: url,
            accessTime: new Date(),
            title: title
          };
      }

      // update the IndexDB recentSheets entry in the database with the new entry
      try {
        await update('recentSheets', (oldRecentSheets) => {
          let newRecentSheets = (oldRecentSheets || new Map()).set(newKey, newRecentSheet);
          // sort with most recent first and truncate to maxRecentSheetsLength
          newRecentSheets = new Map(
            [...newRecentSheets]
            .sort((a,b) => b[1].accessTime - a[1].accessTime)
            .slice(0, maxRecentSheetsLength)
          );
          return newRecentSheets;
        });

        await retrieveRecentSheets();
      } catch(e) {
        console.log(`Error updating recentSheets: ${e}`)
      }
    }
  }

  async function getMarkdown(getShareableLink = false) {
    let markdown = `# ${$title}\n`;

    if (getShareableLink) {
      modalInfo = {
            state: "uploadPending",
            modalOpen: true,
            heading: "Gerando Arquivo"
      };

      const sheetUrl = await uploadSheet(false);
      if (sheetUrl) {
        markdown += `Uma versão ao vivo deste cálculo está disponível em [Boscolab](${sheetUrl}).\n\n`;
      } else {
        markdown += `Ocorreu um erro ao gerar um link compartilhável para este documento.\n\n`;
      }

      modalInfo.modalOpen = false;
    }

    markdown += await cellList.getMarkdown();

    return markdown;
  }

  /*async function getDocument(docType: "docx" | "pdf" | "md" | "tex", getShareableLink = false) {
    const markDown = "<!-- Created with Boscolab -->\n" + await getMarkdown(getShareableLink);
    const upload_blob = new Blob([markDown], {type: "text/markdown"});

    if (docType === "md") {
      saveFileBlob(upload_blob, `${$title}.${docType}`);
      return
    }

    const upload_file = new File([upload_blob], "input.md", {type: "text/markdown"});
    const formData = new FormData();
    formData.append("request_file", upload_file);

    modalInfo = {state: "generatingDocument", modalOpen: true, heading: "Gerando Arquivo"};

    try {
      const response = await fetch(`${apiUrl}/docgen/${docType}`, {
        method: "POST",
        body: formData
      });

      if (response.ok) {
        const fileBlob = await response.blob();

        saveFileBlob(fileBlob, `${$title}.${docType}`);

        modalInfo.modalOpen = false;
      } else {
        let errorMessage = await response.text();
        try {
          const errorObject = JSON.parse(errorMessage);
          errorMessage = errorObject.detail;
        } catch {
        }

        throw new Error(`${response.status} ${errorMessage}`);
      }
    } catch (error) {
      console.log(`Error creating ${docType} document: ${error}`);
      modalInfo = {
        state: "error",
        error: error,
        modalOpen: true,
        heading: modalInfo.heading};
    }
  }*/

/*async function getDocument(docType: "docx" | "pdf" | "md" | "tex", getShareableLink = false) {
  const markDown = "<!-- Created with Boscolab -->\n" + await getMarkdown(getShareableLink);

  // Codifica o conteúdo do arquivo em base64
  const base64Content = btoa(markDown);

  const requestBody = JSON.stringify({
    fileContent: base64Content,  // Envia o conteúdo do arquivo em base64
  });

  if (docType === "md") {
    saveFileBlob(new Blob([markDown], {type: "text/markdown"}), `${$title}.${docType}`);
    return;
  }

  modalInfo = {state: "generatingDocument", modalOpen: true, heading: "Gerando Arquivo"};

  try {
    const apiUrl = "https://zfikzh4oaf.execute-api.us-east-2.amazonaws.com/novoestagio";
    
    const response = await fetch(`${apiUrl}/docgen?docType=${docType}`, {
      method: "POST",
      body: requestBody,  // Envia o corpo como JSON
      //headers: {
      //  "Accept": "application/json",
      //},
      //mode: "cors",
    });

    if (response.ok) {
      const fileBlob = await response.blob();
      saveFileBlob(fileBlob, `${$title}.${docType}`);
      modalInfo.modalOpen = false;
    } else {
      let errorMessage = await response.text();
      try {
        const errorObject = JSON.parse(errorMessage);
        errorMessage = errorObject.detail;
      } catch {}

      throw new Error(`${response.status} ${errorMessage}`);
    }
  } catch (error) {
    console.log(`Error creating ${docType} document: ${error}`);
    modalInfo = {
      state: "error",
      error: error,
      modalOpen: true,
      heading: modalInfo.heading
    };
  }
}*/

async function getDocument(docType: "docx" | "pdf" | "md" | "tex" | "odt" | "html", getShareableLink = false) {
  const markDown = "<!-- Created with Boscolab -->\n" + await getMarkdown(getShareableLink);
  const uploadBlob = new Blob([markDown], { type: "text/markdown" });

  if (docType === "md") {
    saveFileBlob(uploadBlob, `${$title}.${docType}`);
    return;
  }

  const uploadFile = new File([uploadBlob], "input.md", { type: "text/markdown" });
  const formData = new FormData();
  formData.append("request_file", uploadFile);
  formData.append("docType", docType);

  console.log("Iniciando upload para API...");
  modalInfo = { state: "generatingDocument", modalOpen: true, heading: "Gerando Arquivo" };

  try {
    const apiUrl = "https://zfikzh4oaf.execute-api.us-east-2.amazonaws.com/novoestagio/docgen";
    const response = await fetch(apiUrl, {
      method: "POST",
      body: formData,
    });

    if (response.ok) {
      const fileBlob = await response.blob();
      console.log("Documento gerado com sucesso, iniciando download...");
      saveFileBlob(fileBlob, `${$title}.${docType}`);
      modalInfo.modalOpen = false;
    } else {
      const errorMessage = await response.text();
      console.error(`Erro ao gerar documento: ${errorMessage}`);
      throw new Error(`Erro ${response.status}: ${errorMessage}`);
    }
  } catch (error) {
    console.error("Erro ao criar documento:", error);
    modalInfo = {
      state: "error",
      error,
      modalOpen: true,
      heading: modalInfo.heading,
    };
  }
}


  async function retrieveRecentSheets() {
    try {
      const localRecentSheets = (await get('recentSheets') as RecentSheets);
      if (localRecentSheets) {
        recentSheets = localRecentSheets;
      }
    } catch(e) {
      console.log(`Error retrieving recentSheets: ${e}`);
    }
  }

  function showSyntaxError() {
    const elem = document.querySelector('svg.error').parentNode;
    if (elem instanceof HTMLElement) {
      elem.scrollIntoView({behavior: "smooth", block: "center"});
      elem.focus({preventScroll: true});
      // need to call focus twice since first focus may change cell focus
      setTimeout(() => elem.focus({preventScroll: true}), 100);
    }
  }

  function ensureMathFieldVisible(event: TransitionEvent | MouseEvent) {
    if ( ( (event.target === document.getElementById('keyboard-tray') && event instanceof TransitionEvent)
           || event instanceof MouseEvent ) 
        && $activeMathField
        && $activeMathField.element )
    {
      if ( !isVisible(
               $activeMathField.element.getMathField().parentElement,
               document.getElementById('main-content')) 
          ) {
        $activeMathField.element.getMathField().parentElement.scrollIntoView({
            behavior: "smooth",
            block: "center"
        });
      }
    }
  }

  function handleLinkPushState(e: MouseEvent, path) {
    if (e.button === 0) {
      window.history.pushState(null, "", path);
      e.preventDefault();
      refreshSheet();
    }
  }

  async function updateServiceWorker() {
    const registration = await navigator.serviceWorker.getRegistration();
    if (registration?.waiting) {
      registration.waiting.postMessage({ type: "SKIP_WAITING" });

      // Aguarda a atualização e recarrega a página
      registration.waiting.addEventListener("statechange", (event) => {
        if ((event.target as ServiceWorker).state === "activated") {
          window.location.reload();
        }
      });
    }
  }

  function handleUpdateAvailable() {
    modalInfo = {
      modalOpen: true,
      state: "updateAvailable",
      heading: "Nova Atualização Disponível"
    };
  }

  function handleGetShareableLink() {
    modalInfo = {
      state: "uploadSheet",
      modalOpen: true,
      heading: "Obter Link Compartilhável"
    };
  }

  function handleSheetSettings() {
    modalInfo = {
      modalOpen: true,
      state: "sheetSettings",
      heading: "Opções da Planilha",
      mathCell: null,
      mathCellElement: null
    };
  }

  function handleUnitsModal() {
    modalInfo = {
      modalOpen: true,
      state: "supportedUnits",
      heading: "Unidades"
    };
  }

  function handleKeyboardShortcutsModal() {
    modalInfo = {
      modalOpen: true,
      state: "keyboardShortcuts",
      heading: "Atalhos"
    };
  }

  function handleCustomMatrix(event: CustomEvent<{targetMathField: MathField}>) {
    modalInfo = {
      modalOpen: true,
      state: "customMatrix",
      heading: "Inserir Matriz",
      targetMathField: event.detail.targetMathField
    };
  }

  $:if (document.hasFocus() && showKeyboard !== Boolean($activeMathField)) {
      showKeyboard = Boolean($activeMathField);
    }

  $: document.title = `Boscolab: ${$title}`;

  $: if($mathCellChanged) {
    refreshCounter++;
    $mathCellChanged = false;
    noParsingErrors = !checkParsingErrors();
    if (initialSheetLoad) {
      handleCellUpdate(refreshCounter);
    } else {
      inDebounce = true;
      debounceHandleCellUpdate(refreshCounter);
    }
    $unsavedChange = true;
    $autosaveNeeded = true;
  }

  $: if ($nonMathCellChanged) {
    $unsavedChange = true;
    $autosaveNeeded = true;
    $nonMathCellChanged = false;
  }

  $: usingDefaultConfig = isDefaultConfig($config);

</script>

<style>
  :root {
    --keyboard-tray-height: 200px;
    --status-footer-height: 64px;
  }

  button {
    border-radius: 5px;
  }

  button.link {
    border: none;
    color: darkorange;
    cursor: pointer;
    padding: 0px;
    background: none;
  }

  button.link:hover {
    background: none;
  }

  div.shareable-link {
    display: flex;
    align-items: baseline;
    justify-content: center;
  }

  :global(div.status > div) {
    width: max-content;
  }

  label.shareable-link-label {
    padding-right: 0.5em;
  }

  div.page {
    display: grid;
    grid-auto-flow: row;
    align-content: start;
    grid-template-rows: auto 1fr auto;
  }

  .nav-separator {
    width: 100%;
    height: 1px;
    background-color: #525252;
    margin: 4px 0;
  }

  @media screen {
    div.page {
      height: 100%;
    }
    div.page.inIframe.autosizeIframeHeight {
      height: fit-content;
    }
  }

  @media print {
    div.page {
      display: block;
    }
  }

  :global(.bx--header) {
    position: static !important;
    flex-wrap: wrap !important;
    height: fit-content !important;
    width: 100vw;
    overflow-x: auto;
    justify-content: flex-end;
    background: linear-gradient(45deg, black, #383838, #383838, #ff9800);
    box-shadow: 3px 3px 5px rgba(0,0,0,0.4);
    border-bottom: 1px solid #f29203;
  }

  @media print {
    :global(.bx--header) {
      display: none !important;
    }
  }

  :global(.bx--header__name) {
    padding: 0px !important;
    flex-grow: 1;
  }

  :global(.bx--header__global) {
    flex: 0 1 auto;
  }

  :global(nav.bx--side-nav__navigation) {
    background-color: #383838;
    border-right: solid 1px #f49303;
  }

  :global(a.bx--side-nav__link>.bx--side-nav__link-text) {
    color: white;
  }
  
  :global(.bx--side-nav__submenu) {
    color: white;
  }

  :global(.bx--btn--primary) {
    background-color: darkorange;
  }

  :global(.bx--modal.is-visible .bx--modal-container) {
    background-color: #383838;
  }
  
  :global(.bx--modal-content) {
    color: white;
  }

  :global(.bx--modal-header__heading) {
    color: white;
  }

  :global(.bx--label) {
    color: darkorange;
  }

  :global(.bx--radio-button:checked+.bx--radio-button__label .bx--radio-button__appearance::before) {
    background-color: darkorange;
  }

  :global(.bx--radio-button__appearance) {
    border: 1px solid white;
  }
  
  :global(.bx--radio-button:checked+.bx--radio-button__label .bx--radio-button__appearance) {
    border-color: white;
  }
  
  :global(.bx--tabs__nav-item .bx--tabs__nav-link) {
    color: white !important;
  }

  :global(.bx--modal-content--overflow-indicator) {
    bottom: 2.9 rem;
    background-image: linear-gradient(0deg, #383838, transparent);
  }

  :global(.bx--modal-close__icon) {
    fill: white;
  }

  :global(span.key.svelte-1bx9xya) {
    background-color: darkgreen;
  }
  
  :global(.bx--btn--tertiary) {
    color: white;
  }

  :global(.bx--checkbox-label::before) {
    border: 1px solid white;
  }

  :global(.hideToolbar.svelte-fpogmb .ql-toolbar.ql-snow + .ql-container) {
    border-top-style: dashed;
  }

  @media print {
    :global(nav.bx--side-nav__navigation) {
      display: none;
    }

    :global(div.bx--side-nav__overlay) {
      display: none;
    }
  }

  :global(.bx--side-nav__menu a.bx--side-nav__link) {
    height: fit-content !important;
    padding-right: 0px;
  }

  :global(.bx--snippet--light) {
    background-color: white;
    color: black;
  }

  :global(.bx--inline-loading__text) {
    color: white;
  }

  div.side-nav-title {
    overflow: hidden;
    text-overflow: ellipsis;
  }

  em.side-nav-date {
    font-size: smaller;
    padding-left: 10px;
  }

  :global(#main-content) {
    grid-row: 2;
    grid-column: 1;
    display: flex;
    justify-content: center;
    margin-top: 0;
    overflow: auto;
    position: static;
    height: 100%;
    padding: 0px 0px 0px 0px;
  }

  @media print {
    :global(#main-content) {
      overflow: visible;
      margin-left: 0px;
    }
  }

  :global(page.inIframe #main-content) {
    height: fit-content;
  }

  div.bottom-spacer {
    height: calc(var(--status-footer-height) + var(--keyboard-tray-height));
  }

  div.bottom-spacer.inIframe {
    display: none;
  }

  #sheet {
    width: min-content;
    min-width: min(1000px, 100%);
    height: fit-content;
    padding-top: 28px;
    z-index: 2;
  }

  div.sheet-margin {
    flex-grow: 1;
    position: sticky;
    top: 0px;
    z-index: 1;
    background: gray;
  }

  div.sheet-margin-left {
    width: 1px;
    flex-grow: 0;
    position: sticky;
    top: 0px;
    z-index: 2;
    background: gray;
    box-shadow: -8px 3px 8px black;
  }

  @media print {
    div.sheet-margin-left {
      width: 1px;
      flex-grow: 0;
      position: sticky;
      top: 0px;
      z-index: 2;
      background: gray;
      box-shadow: -8px 3px 8px black;
    }
  }

  div.sheet-margin-right {
    width: 1px;
    flex-grow: 0;
    position: sticky;
    top: 0px;
    z-index: 2;
    background: gray;
    box-shadow: 8px 3px 8px black;
  }

  @media print {
    div.sheet-margin-right {
      width: 1px;
      flex-grow: 0;
      position: sticky;
      top: 0px;
      z-index: 2;
      background: gray;
      box-shadow: 8px 3px 8px black;
    }
  }

  #keyboard-tray {
    display: flex;
    justify-content: center;
    transition: 0.3s;
    transition-delay: 0.1s;
    overflow: hidden;
    background-color: #383838;
    border-top: 1px solid #ff9800;    
  }

  #keyboard-tray.inIframe {
    display: none;
  }

  @media print {
    #keyboard-tray {
      display: none;
    }
  }
  

  div.status-footer {
    grid-row: 2;
    grid-column: 1;
    justify-self: end;
    align-self: end;
    overflow-y: auto;
    max-height: var(--status-footer-height);
    padding: 5px;
    border-radius: 10px 0px 0px 0px;
    bottom: var(--keyboard-tray-height);
    right: 0;
    color: white;
    background: #383838;
    border-top: 1px #383838 solid;
    border-left: 1px #383838 solid;
    z-index: 100;
    display: flex;
    align-items: center;
    justify-content: flex-start;
    gap: 5px;  
  }

  @media print {
    div.status-footer {
      display: none;
    }
  }

  div.status-footer.promise {
    z-index: 200;
  }

  img.logo {
    height: 1.37em;
    max-width: 40vw;
  }

  span.logo {
    display: flex;
    align-items: center;
  }

  .print-logo {
    display: flex;
    align-items: center;
    gap: 10px;
    justify-content: flex-end;
    padding: 8px;
  }

  @media screen {
    .print-logo {
      display: none;
    }
  }

  :global(#update-icon) {
    fill: limegreen;
  }

  :global(.standalone) {
    display: none;
  }

  @media all and (display-mode: standalone) {
    :global(.standalone) {
      display: block;
    }
  }

  @media (max-width: 450px) {
    :global(.hide-when-kinda-narrow) {
      display: none;
    }
  }

  @media (max-width: 400px) {
    :global(.hide-when-narrow) {
      display: none;
    }
  }

  @media (max-width: 330px) {
    :global(.hide-when-really-narrow) {
      display: none;
    }
  }

  div.dot-container {
    position: relative;
  }

  div.dot {
    position: absolute;
    top: 20%;
    right: 27%;
    height: 5px;
    width: 5px;
    border-radius: 50%;
    background-color: limegreen;
  }

</style>

{#if fileDropActive}
  <DropOverlay
    on:click={e => fileDropActive=false}
    on:drop={handleFileDrop}
    on:dragenter={e => fileDropActive=true}
    on:dragleave={e => fileDropActive=false}
  />
{/if}

<!-- The nonstatic element actions (drag and drop to open file and click margin to unselect all) duplicate functionality  
     available through keyboard shortcuts (Cntrl-O and Escape, respectively). File open is also avialable through a separate button -->
<!-- svelte-ignore a11y-no-static-element-interactions -->
<!-- svelte-ignore a11y-click-events-have-key-events -->

<div
  class="page"
  class:inIframe
  class:autosizeIframeHeight={Boolean(autosizeIframeId)}
	on:dragover|preventDefault
	on:dragenter={e => fileDropActive = !modalInfo.modalOpen}
>
  <Header
    bind:isSideNavOpen={sideNavOpen}
    persistentHamburgerMenu={!inIframe}
  >
    <span 
      class="logo" 
      slot="platform"
      on:click={() => $activeCell = -1}
    >
      <img class="logo" src="logo_dark.png" alt="Boscolab">
    </span>

    <DocumentTitle bind:title={$title}/>
    
    <!--{#if serviceWorkerUpdateWaiting}
      <HeaderGlobalAction 
        title="Nova Atualização Disponível" 
        on:click={handleUpdateAvailable}
      >
        <Renew size={20} id="update-icon"/>
      </HeaderGlobalAction>
    {/if}-->
    {#if $serviceWorkerUpdateWaiting}
      <HeaderGlobalAction 
        title="Nova Atualização Disponível" 
        on:click={updateServiceWorker}
      >
        <Renew size={20} id="update-icon"/>
      </HeaderGlobalAction>
    {/if}
    <HeaderGlobalAction 
      class="standalone"
      title="Voltar"
      on:click={() => window.history.back()}
      icon={ArrowLeft}
    />
    <HeaderGlobalAction 
      class="standalone"
      title="Avançar"
      on:click={() => window.history.forward()}
      icon={ArrowRight}
    />
    <HeaderGlobalAction
      class="standalone hide-when-narrow"
      title="Imprimir"
      on:click={() => window.print()}
      icon={Printer}
    />

    <div slot="skip-to-content">
      <SkipToContent />
    </div>

    <HeaderUtilities>
      {#if !inIframe}
        <HeaderActionLink
          id="new-sheet"
          title="Nova Planilha"
          href="/" 
          icon={DocumentBlank}
          on:click={ (e) => handleLinkPushState(e, '/') }
        />
        <HeaderGlobalAction
          id="open-sheet"
          title="Abrir Planilha"
          on:click={handleFileOpen}
          icon={Folder}
        />
        <HeaderGlobalAction
          id="save-sheet"
          title="Salvar Planilha"
          on:click={loadSaveSheetModal}
          icon={Download}
        />
        <HeaderGlobalAction
          id="upload-sheet"
          title="Compartilhar Planilha"
          on:click={handleGetShareableLink} 
          icon={CloudUpload}
        />
        <!--<HeaderActionLink
          href={`/${tutorialHash}`}
          title="Tutorial"
          rel="nofollow"
          icon={Help}
          on:click={(e) => handleLinkPushState(e, `/${tutorialHash}`) }
        />-->
        <div class="dot-container">
          <HeaderGlobalAction 
            title={"Opções da Planilha" + (usingDefaultConfig ? "" : " (Modificado)")}
            on:click={handleSheetSettings} 
            icon={SettingsAdjust}
          />
          {#if !usingDefaultConfig}
            <div class="dot"></div>
          {/if}
        </div>
        <!--<HeaderGlobalAction
          title="Unidades"
          on:click={handleUnitsModal}
          icon={Ruler}
        />
        <HeaderGlobalAction 
          class="hide-when-narrow" 
          title="Atalhos" 
          on:click={handleKeyboardShortcutsModal}
          icon={Keyboard}
        />-->
      {:else}
        <HeaderGlobalAction
          title="Abrir Esta Planilha em Nova Aba"
          on:click={() => window.open(window.location.href, "_blank")}
          icon={Launch}
        />
      {/if}
    </HeaderUtilities>
  </Header>


  {#if !inIframe}
    <SideNav
      bind:isOpen={sideNavOpen}
      on:open={retrieveRecentSheets}
      on:close={() => window.dispatchEvent(new Event('resize'))}
    >      
      <SideNavItems>        
        <!--<SideNavMenu text="Prebuilt Tables">
          {#each prebuiltTables as {url, title} (url)}
            <SideNavMenuItem 
              href={`/${getSheetHash(new URL(url))}`}
              rel="nofollow"
              on:click={(e) => handleLinkPushState(e, `/${getSheetHash(new URL(url))}`)}
            >
              <div title={title} class="side-nav-title">{title}</div>
            </SideNavMenuItem>
          {/each}
        </SideNavMenu>-->
        {#if recentSheets.size > 0}
          <SideNavMenu text="Arquivos Recentes">
            {#each [...recentSheets] as [key, value] (key)}
              {#if "url" in value}
                <SideNavMenuItem
                  isSelected={getSheetHash(new URL(value.url)) === currentState.slice(1)}
                  href={`/${getSheetHash(new URL(value.url))}`}
                  rel="nofollow"
                  on:click={(e) => ("url" in value) ? handleLinkPushState(e, `/${getSheetHash(new URL(value.url))}`) : null}
                >
                  <div title={value.title}>
                    <div class="side-nav-title">
                      {value.title}
                    </div>
                    <em class="side-nav-date">{(new Date(value.accessTime)).toLocaleString()}</em>
                  </div>
                </SideNavMenuItem>
              {:else}
                <SideNavMenuItem
                  isSelected={key === window.history.state?.fileKey}  
                  on:click={async (e) => ("fileHandle" in value) ? openSheetFromFileHandle(value.fileHandle) : null}
                >
                  <div title={value.fileName}>
                    <div class="side-nav-title">
                      {`File: ${value.fileName}`}
                    </div>
                    <em class="side-nav-date">{(new Date(value.accessTime)).toLocaleString()}</em>
                  </div>
                </SideNavMenuItem>
              {/if}
            {/each}
          </SideNavMenu>
        {/if}
        {#if $history.length > 0}
          <SideNavMenu text="Revisões da Planilha">
            {#each $history as {url, hash, creation} (hash+creation)}
              {#if hash === "file"}
                <SideNavMenuItem isSelected={false}>
                  <div title={url}>
                    <div class="side-nav-title">
                      {`Salva como: ${url}`}
                    </div>
                    <em class="side-nav-date">{(new Date(creation)).toLocaleString()}</em>
                  </div>
                </SideNavMenuItem>
              {:else}
                <SideNavMenuItem
                  isSelected={hash === currentState.slice(1)}
                  href={`/${hash}`}
                  text={(new Date(creation)).toLocaleString()}
                  rel="nofollow"
                  on:click={(e) => handleLinkPushState(e, `/${hash}`)}
                />
              {/if}
            {/each}
          </SideNavMenu>
        {/if}
        {#if $insertedSheets.length > 0}
          <SideNavMenu text="Planilhas Adicionadas">
            {#each $insertedSheets as {title, url, insertion}}
              {#if url === "file"}
                <SideNavMenuItem>
                  <div title={title}>
                    <div class="side-nav-title">
                      {`Arquivo adicionado: ${title}`}
                    </div>
                    <em class="side-nav-date">{(new Date(insertion)).toLocaleString()}</em>
                  </div>
                </SideNavMenuItem>
              {:else}
                <SideNavMenuItem
                  href={`/${getSheetHash(new URL(url))}`}
                  rel="nofollow"
                  on:click={(e) => handleLinkPushState(e, `/${getSheetHash(new URL(url))}`)}
                >
                  <div title={title}>
                    <div class="side-nav-title">
                      {title}
                    </div>
                    <em class="side-nav-date">{(new Date(insertion)).toLocaleString()}</em>
                  </div>
                </SideNavMenuItem>
              {/if}
            {/each}
          </SideNavMenu>
        {/if}   
        
        <div class="nav-separator"/>

        <SideNavLink 
          on:click={() => window.print()}
          text="Imprimir"
        />

        <div class="nav-separator"/>

        <SideNavLink 
          on:click={(e) => handleLinkPushState(e, `/${tutorialHash}`) }
          href={`/${tutorialHash}`}
          rel="nofollow"
          text="Ajuda"
        />
        <SideNavMenu text="Exemplos">
          {#each exampleSheets as {path, title} (path)}
            <SideNavMenuItem 
              href={path}
              rel="nofollow"
              on:click={(e) => handleLinkPushState(e, path)}
            >
              <div title={title} class="side-nav-title">{title}</div>
            </SideNavMenuItem>
          {/each}
        </SideNavMenu> 

        <div class="nav-separator"/>
        
        <SideNavLink 
          on:click={handleKeyboardShortcutsModal}
          text="Atalhos"
        />
        <SideNavLink 
          on:click={handleUnitsModal}
          text="Unidades"
        />        

        <div class="nav-separator"/>

        <SideNavLink 
          on:click={() => showTerms()}
          text="Termos e Condições"
        />
        <!--<SideNavLink
          on:click={() => modalInfo = {
              modalOpen: true,
              state: "bugReport",
              heading: "Notificar Bug"
          }}
          text="Notificar Bug"
        />
        <SideNavLink 
          on:click={() => modalInfo = {
            modalOpen: true,
            state: "newVersion",
            heading: "New Features"
          }}
          text="New Features"
        />-->
        <!--<SideNavLink 
          on:click={() => showRequestPersistentStorage()}
          text="Enable Persistent Local Storage"
        />-->
        <!--<SideNavLink
          on:click={() => modalInfo = {
              modalOpen: true,
              state: "tryBlab",
              heading: "Now Available at boscolab.com"
          }}
          text="boscolab.com.br blocked? Try blab.com"
        />
        <SideNavLink
          href="https://blog.boscolab.com.br"
          text="Blog"
          target="_blank"
        />
        <SideNavLink
          href="https://github.com/engjango/boscolab"
          text="GitHub Page"
          target="_blank"
        />
        <SideNavLink
          href="https://www.youtube.com/@blab"
          text="YouTube Channel"
          target="_blank"
        />
        <SideNavLink
          href="https://www.reddit.com/r/boscolab/"
          text="Reddit Community"
          target="_blank"
        />-->
      </SideNavItems>
    </SideNav>
  {/if}


  <Content>
    <div
      class="sheet-margin"
      on:click={() => $activeCell = -1}
    >
    </div>

    <div class="sheet-margin-left"></div>  

    <div id="sheet">
      <!--<DocumentTitle bind:title={$title}/>-->

      <CellList
        on:insertSheet={loadInsertSheetModal}
        on:updateNumberFormat={loadCellNumberFormatModal}
        on:generateCode={loadGenerateCodeModal}
        on:insertMathCellAfter={handleInsertMathCell}
        on:insertInsertCellAfter={handleInsertInsertCell}
        on:modal={handleCellModal}
        bind:this={cellList}
      />

      <div class="print-logo">
        Orgulhosamente desenvolvido com <img src="logo_with_background.png" alt="Boscolab" height="14 px">
      </div>

      <div class="bottom-spacer" class:inIframe></div>
    </div>

    <div class="sheet-margin-right"></div>  
    
    <div
      class="sheet-margin"
      on:click={() => $activeCell = -1}
    >
    </div>

  </Content>

  <div
    id="keyboard-tray" 
    class:inIframe
    style={`height: ${showKeyboard && !inIframe ? 'var(--keyboard-tray-height)' : '0px'}`}
    on:transitionend={ensureMathFieldVisible}
    on:mousedown={ (event) => {event.preventDefault(); ensureMathFieldVisible(event);} }
  >
    <VirtualKeyboard
      keyboards={keyboards}
      on:customMatrix={handleCustomMatrix}
    />
  </div>

  {#if (termsAccepted < termsVersion) && !inIframe}
    <div class="status-footer" on:mousedown={e=>e.preventDefault()}>
      <InformationFilled color="#f99501"/>
      <div>
        O uso deste software está sujeito aos  
        <button class="link" on:click={showTerms}>
          Termos e Condições
        </button>  (Revisado em {versionToDateString(termsVersion)})
      </div>
      <button on:click={acceptTerms}>Aceitar</button>
    </div>
  {:else}
    {#if noParsingErrors}
      {#if inDebounce && !pyodideNotAvailable && pyodideLoaded}
        <div class="status-footer">
          <InlineLoading status="inactive" description="atualizando..."/>
        </div>
      {:else}
        {#await pyodidePromise}
          {#if !pyodideLoaded && !pyodideNotAvailable && !error}
            <div class="status-footer promise">
              <InlineLoading description="carregando engine..."/>
            </div>
          {:else if pyodideLoaded && !pyodideNotAvailable}  
            <div class="status-footer promise" on:mousedown={e=>e.preventDefault()}>
              <InlineLoading description="atualizando..."/>
              {#if pyodideTimeout}
                <button on:click={restartPyodide}>Reiniciar Engine</button>
              {/if}
            </div>
          {/if}
        {:catch promiseError}
          <div class="status-footer promise">
            <InlineLoading status="error" description={promiseError}/>
          </div>
        {/await}
      {/if}
      {#if error && !inDebounce}
        <div class="status-footer">
          <InlineLoading status="error" description={`Erro: ${error}`} />
        </div>
      {/if}
      {#if pyodideNotAvailable}
        <div class="status-footer">
          <InlineLoading status="error" description={`Erro: Engine falhou ao iniciar.`} />
        </div>
      {/if}
    {:else}
      <div class="status-footer" on:mousedown={e=>e.preventDefault()}>
        <ErrorFilled color="#da1e28"/>
        <div>
          Planilha contém erro de sintaxe.
          Veja este
          <a
            href={`/${tutorialHash}`}
            rel="nofollow"
            on:click={(e) => handleLinkPushState(e, `/${tutorialHash}`)}
          >
            tutorial
          </a>
          sobre como criar uma planilha.
        </div>
        <button on:click={showSyntaxError}>Ver Erro</button>
      </div>
    {/if}
  {/if}

  {#if modalInfo.modalOpen}
    {#if modalInfo.state === "sheetSettings"}
      <Modal
        modalHeading={modalInfo.heading}
        primaryButtonText="Confirmar"
        secondaryButtonText="Restaurar"
        on:click:button--primary={() => modalInfo.modalOpen = false}
        on:click:button--secondary={() => {mathCellConfigDialog?.resetDefaults();
                                           baseUnitsConfigDialog?.resetDefaults();
                                           $config.simplifySymbolicExpressions = true;
                                           $config.convertFloatsToFractions = true;}}
        bind:open={modalInfo.modalOpen}
      >
        {#if modalInfo.mathCell}
          <MathCellConfigDialog
            bind:this={mathCellConfigDialog}
            mathCellConfig={modalInfo.mathCell.config}
            mathCellElement={modalInfo.mathCellElement}
            cellLevelConfig={true}
          />
        {:else}
          <Tabs>
            <Tab label="Números" />
            <Tab label="Unidades Padrão" />
            <Tab label="Padrão do Usuário" />
            <svelte:fragment slot="content">
              <TabContent>
                <Checkbox 
                  labelText="Simplificar Automaticamente Expressões Simbólicas."
                  bind:checked={$config.simplifySymbolicExpressions}
                  on:check={() => $mathCellChanged = true}
                />
                <Checkbox 
                  labelText="Converter Automaticamente Valores Decimais para Frações."
                  bind:checked={$config.convertFloatsToFractions}
                  on:check={() => $mathCellChanged = true}
                />
                <MathCellConfigDialog
                  bind:this={mathCellConfigDialog}
                  bind:mathCellConfig={$config.mathCellConfig}
                />
              </TabContent>
              <TabContent>
                <BaseUnitsConfigDialog 
                  bind:this={baseUnitsConfigDialog}
                  bind:baseUnits={$config.customBaseUnits}
                />
              </TabContent>
              <TabContent>
                <SetDefaultConfigDialog />
              </TabContent>
            </svelte:fragment>
          </Tabs>
        {/if}
      </Modal>
    {:else if modalInfo.state === "customMatrix"}
      <CustomMatrixModal 
        bind:open={modalInfo.modalOpen}
        targetMathField={modalInfo.targetMathField}
      />
    {:else if modalInfo.state === "downloadDocument"}
      <DownloadDocumentModal
        bind:open={modalInfo.modalOpen}
        on:downloadSheet={(e) => saveSheetToFile(e.detail.saveAs)}
        on:downloadDocument={(e) => getDocument(e.detail.docType, e.detail.getShareableLink)}
      />
    {:else}
      <Modal
        passiveModal={!(modalInfo.state === "uploadSheet" || modalInfo.state === "insertSheet")}
        bind:open={modalInfo.modalOpen}
        modalHeading={modalInfo.heading}
        primaryButtonText="Confirmar"
        secondaryButtonText="Cancelar"
        on:click:button--secondary={() => (modalInfo.modalOpen = false)}
        on:open
        on:close
        on:submit={ modalInfo.state === "uploadSheet" ? () => uploadSheet() : () => insertSheet() }
        hasScrollingContent={["supportedUnits", "insertSheet", "termsAndConditions",
                            "newVersion", "keyboardShortcuts", "generateCode"].includes(modalInfo.state)}
        preventCloseOnClickOutside={!["supportedUnits", "bugReport", "tryBlab", "newVersion", "updateAvailable", 
                                      "keyboardShortcuts"].includes(modalInfo.state)}
      >
        {#if modalInfo.state === "uploadSheet"}
          <p>Salvar este documento na nuvem irá criar um link compartilhável privado que poderá ser usado para acessar este documento no futuro. Qualquer pessoa com quem você compartilhar este link poderá acessar o documento.</p>
        {:else if modalInfo.state === "uploadPending"}
          <InlineLoading description="Obtendo Link Compartilhável..."/>
        {:else if modalInfo.state === "success"}
          <p>Anote ou salve este link em seu dispositivo para poder acessar ou compartilhar esta planilha.</p>
          <br>
          <div class="shareable-link">
            <label for="shareable-link" class="shareable-link-label">Link Compartilhável:</label>
            <input type="text" id="shareable-link" value={modalInfo.url} size=50 readonly>
            <CopyButton text={modalInfo.url} />
          </div>
        {:else if modalInfo.state === "retrieving"}
          <InlineLoading description={`Recuperando arquivo: ${window.location}`}/>
        {:else if modalInfo.state === "generatingDocument"}
          <InlineLoading description={`Gerando arquivo...`}/>
        {:else if modalInfo.state === "opening"}
          <InlineLoading description={`Abrindo arquivo`}/>
        {:else if modalInfo.state === "importingSpreadsheet"}
          <InlineLoading description={`Importando arquivo`}/>
        {:else if modalInfo.state === "saving"}
          <InlineLoading description={`Salvando arquivo`}/>
        {:else if modalInfo.state === "restoring"}
          <InlineLoading description={`Restaurando checkpoint: ${window.location}`}/>
        {:else if modalInfo.state === "bugReport"}
          <p>
            Caso você tenha identificado um erro no Boscolab, pedimos que envie um relatório detalhado para 
            <a href={`mailto:suporte@boscolab.com.br?subject=Relatório de Erro&body=Planilha com problemas: ${encodeURIComponent(window.location.href)}`} aria-label="Enviar e-mail para suporte com detalhes do erro">suporte@boscolab.com.br</a>. 
          </p>
          <p>
              Por favor, inclua uma descrição clara do problema e, se possível, adicione o link da planilha em que o erro foi encontrado. Essas informações ajudarão nossa equipe a diagnosticar e resolver a questão de forma mais eficiente.
          </p>      
        {:else if modalInfo.state === "tryBlab"}
          <p>
            Para garantir a acessibilidade do Boscolab para todos, sua funcionalidade completa também está disponível em 
            <a href="https://boscolab.com" target="_blank">boscolab.com</a>. Ambos os domínios oferecem os mesmos recursos, e planilhas salvas em um podem ser acessadas no outro. Links compartilháveis são totalmente intercambiáveis. Por exemplo: 
            <a href="https://boscolab.vercel.app/fFjTsnFoSQMLwcvteVoNtL" target="_blank">https://boscolab.vercel.app/fFjTsnFoSQMLwcvteVoNtL</a> e 
            <a href="https://boscolab.com/fFjTsnFoSQMLwcvteVoNtL" target="_blank">https://boscolab.com/fFjTsnFoSQMLwcvteVoNtL</a> levam à mesma planilha.
          </p>      
        {:else if modalInfo.state === "supportedUnits"}
          <UnitsDocumentation />
        {:else if modalInfo.state === "keyboardShortcuts"}
          <KeyboardShortcuts />
        {:else if modalInfo.state === "termsAndConditions"}
          <Terms versionDateString={versionToDateString(termsVersion)}/>
        {:else if modalInfo.state === "requestPersistentStorage"}
          <RequestPersistentStorage numCheckpoints={numCheckpoints} />
        {:else if modalInfo.state === "newVersion"}
          <Updates />
        {:else if modalInfo.state === "insertSheet"}
          <InsertSheet
            bind:url={modalInfo.url}
            on:fileSelected={handleInsertSheetFromFile}
            recentSheets={recentSheets}
            prebuiltTables={prebuiltTables}
          />
        {:else if modalInfo.state === "updateAvailable"}
          <UpdateAvailable/>
        {:else if modalInfo.state === "generateCode"}
          <GenerateCodeDialog index={modalInfo.codeGenerationIndex} {pyodidePromise}/>
        {:else}
          <InlineLoading status="error" description="Houve um erro" />
          {@html modalInfo.error}
        {/if}
      </Modal>
    {/if}
  {/if}

</div>


