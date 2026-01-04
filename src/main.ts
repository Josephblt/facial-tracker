import "./styles/main.css";
import { createDock } from "./ui/dock";
import { createMenuButton } from "./ui/buttons/menuButton";
import { createDialogButton } from "./ui/buttons/dialogButton";
import { createDialog } from "./ui/components/dialogComponent";
import { createConsoleComponent } from "./ui/components/consoleComponent";
import { createMenuComponent } from "./ui/components/menuComponent";
import { createCameraComponent } from "./ui/components/cameraComponent";
import { ConsoleService } from "./services/consoleService";
import { CameraService } from "./services/cameraService";
import { menuIcon, consoleIcon, settingsIcon } from "./ui/icons";

const appRoot = document.getElementById("app") || document.body;
appRoot.replaceChildren();

const dock = createDock();

const menuButton = createMenuButton({
	icon: menuIcon,
	ariaLabel: "Main Menu"
});
const menuComponent = createMenuComponent({
	content: ""
});

const consoleButton = createDialogButton({
	icon: consoleIcon,
	ariaLabel: "Console"
});
const consoleDialog = createDialog({
	title: "Console",
	content: ""
});

const settingsButton = createDialogButton({
	icon: settingsIcon,
	ariaLabel: "Settings"
});
const settingsDialog = createDialog({
	title: "Settings",
	content: ""
});

dock.addMenu(menuButton, menuComponent.element);
dock.addDialog(consoleButton, consoleDialog.element);
dock.addDialog(settingsButton, settingsDialog.element);

const consoleService = new ConsoleService();
const consoleComponent = createConsoleComponent(consoleService);
consoleDialog.setContent(consoleComponent.element);

const cameraService = new CameraService(consoleService);
const cameraComponent = createCameraComponent(cameraService, {
	ariaLabel: "Camera feed"
});
appRoot.appendChild(cameraComponent.element);
void cameraComponent.start();
