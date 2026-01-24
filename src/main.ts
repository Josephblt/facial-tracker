import "./styles/main.css";
import "./styles/controls/scrollbar.css";
import { createDock } from "./ui/containers/dock";
import { createButton } from "./ui/controls/button";
import type { ButtonOptions } from "./ui/controls/button";
import { createDialog } from "./ui/containers/dialog";
import { createConsoleContent } from "./ui/content/console";
import { createMenu } from "./ui/containers/menu";
import { createCameraComponent } from "./ui/content/camera";
import { createSettingsContent } from "./ui/content/settings";
import { ConsoleService } from "./services/consoleService";
import { CameraService } from "./services/cameraService";
import { menuIcon, consoleIcon, settingsIcon } from "./ui/icons";

const consoleService = new ConsoleService();
const cameraService = new CameraService(consoleService);

const appRoot = document.getElementById("app") || document.body;
appRoot.replaceChildren();

const dock = createDock();

const menuButtonOptions: ButtonOptions = {
	icon: menuIcon,
	ariaLabel: "Main Menu"
};
const menuButton = createButton(menuButtonOptions);
const menu = createMenu({
	content: ""
});

const consoleButtonOptions: ButtonOptions = {
	icon: consoleIcon,
	ariaLabel: "Console"
};
const consoleButton = createButton(consoleButtonOptions);
const consoleDialog = createDialog({
	title: "Console",
	content: ""
});

const settingsButtonOptions: ButtonOptions = {
	icon: settingsIcon,
	ariaLabel: "Settings"
};
const settingsButton = createButton(settingsButtonOptions);
const settingsDialog = createDialog({
	title: "Settings",
	content: ""
});

dock.addMenu(menuButton, menu.element);
dock.addDialog(consoleButton, consoleDialog.element);
dock.addDialog(settingsButton, settingsDialog.element);

const cameraComponent = createCameraComponent(cameraService, {
	ariaLabel: "Camera feed"
});
appRoot.appendChild(cameraComponent.element);

const consoleContent = createConsoleContent(consoleService);
consoleDialog.setContent(consoleContent.element);

const settingsContent = createSettingsContent(cameraComponent, cameraService);
settingsDialog.setContent(settingsContent.element);

void cameraComponent.start().finally(() => {
	void settingsContent.refreshCameras();
});
