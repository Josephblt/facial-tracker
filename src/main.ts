import "./styles/main.css";
import "./styles/controls/scrollbar.css";
import { createDock } from "./ui/containers/dock";
import { createButton } from "./ui/controls/button";
import { createBadge } from "./ui/controls/badge";
import type { ButtonOptions } from "./ui/controls/button";
import { createDialog } from "./ui/containers/dialog";
import { createConsole } from "./ui/content/console";
import { createMenu } from "./ui/containers/menu";
import { createCameraComponent } from "./ui/content/camera";
import { createSettings } from "./ui/content/settings";
import { ConsoleService } from "./services/consoleService";
import { CameraService } from "./services/cameraService";
import { menuIcon, consoleIcon, settingsIcon } from "./ui/icons";

function initializeMenu(dock: ReturnType<typeof createDock>) {
	const menuButton = createButton({
		icon: menuIcon,
		ariaLabel: "Main Menu"
	});
	const menu = createMenu({
		content: ""
	});

	dock.addMenu(menuButton, menu.element);
}

function initializeConsole(consoleService: ConsoleService, dock: ReturnType<typeof createDock>) {
	const consoleButton = createButton({
		icon: consoleIcon,
		ariaLabel: "Console"
	});	
	const consoleBadge = createBadge();
	consoleButton.style.position = "relative";
	consoleButton.appendChild(consoleBadge.element);

	const consoleDialog = createDialog({
		title: "Console",
		content: ""
	});

	const console = createConsole(consoleService);
	consoleDialog.setContent(console.element);

	consoleService.onLogChanged((event) => {
		consoleBadge.update(event.counts);
	});

	dock.addDialog(consoleButton, consoleDialog.element);
}

function initializeSettings(
	cameraComponent: ReturnType<typeof createCameraComponent>,
	cameraService: CameraService,
	dock: ReturnType<typeof createDock>
) {
	const settingsButton = createButton({
		icon: settingsIcon,
		ariaLabel: "Settings"
	});
	const settingsDialog = createDialog({
		title: "Settings",
		content: ""
	});

	const settings = createSettings(cameraComponent, cameraService);
	settingsDialog.setContent(settings.element);

	dock.addDialog(settingsButton, settingsDialog.element);

	return {
		refreshCameras: () => settings.refreshCameras()
	};
}

const consoleService = new ConsoleService();
const cameraService = new CameraService(consoleService);

const appRoot = document.getElementById("app") || document.body;
appRoot.replaceChildren();

const dock = createDock();

const cameraComponent = createCameraComponent(cameraService, {
	ariaLabel: "Camera feed"
});
appRoot.appendChild(cameraComponent.element);

initializeMenu(dock);
initializeConsole(consoleService, dock);
const settings = initializeSettings(cameraComponent, cameraService, dock);

void cameraComponent.start().finally(() => {
	void settings.refreshCameras();
});