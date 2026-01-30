"use strict";const e=require("electron");e.contextBridge.exposeInMainWorld("electronAPI",{openFile:()=>e.ipcRenderer.invoke("dialog:openFile")});
