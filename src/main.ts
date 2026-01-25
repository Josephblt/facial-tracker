import "./styles/main.css";
import "./styles/controls/scrollbar.css";
import { createDock } from "./ui/containers/dock";
import { createButton, type ButtonOptions } from "./ui/controls/button";
import { createBadge } from "./ui/controls/badge";
import { createDialog, type DialogOptions } from "./ui/containers/dialog";
import { createConsole } from "./ui/content/console";
import { createMenu } from "./ui/containers/menu";
import { createSettings } from "./ui/content/settings";
import { ConsoleService } from "./services/consoleService";
import { menuIcon, consoleIcon, settingsIcon } from "./ui/icons";

function initializeMenu(dock: ReturnType<typeof createDock>) {
	const menuButtonOptions: ButtonOptions = {
		icon: menuIcon,
		ariaLabel: "Main Menu"
	};
	const menuButton = createButton(menuButtonOptions);
	const menu = createMenu({
		content: ""
	});

	dock.addMenu(menuButton, menu.element);
}

function initializeConsole(dock: ReturnType<typeof createDock>) {
	const consoleService = new ConsoleService();

	const consoleButtonOptions: ButtonOptions = {
		icon: consoleIcon,
		ariaLabel: "Console"
	};
	const consoleButton = createButton(consoleButtonOptions);
	
	const consoleBadge = createBadge();
	consoleButton.style.position = "relative";
	consoleButton.appendChild(consoleBadge.element);

	const consoleDialogOptions: DialogOptions = {
		title: "Console",
		content: ""
	};
	const consoleDialog = createDialog(consoleDialogOptions);

	const console = createConsole(consoleService);
	consoleDialog.setContent(console.element);

	consoleService.onLogChanged((event) => {
		consoleBadge.update(event.counts);
	});

	dock.addDialog(consoleButton, consoleDialog.element);
}

function initializeSettings(dock: ReturnType<typeof createDock>) {
	const settingsButtonOptions: ButtonOptions = {
		icon: settingsIcon,
		ariaLabel: "Settings"
	};
	const settingsButton = createButton(settingsButtonOptions);
	const settingsDialogOptions: DialogOptions = {
		title: "Settings",
		content: ""
	};
	const settingsDialog = createDialog(settingsDialogOptions);

	const settings = createSettings();
	settingsDialog.setContent(settings.element);

	dock.addDialog(settingsButton, settingsDialog.element);
}

const appRoot = document.getElementById("app") || document.body;
appRoot.replaceChildren();

const dock = createDock();

initializeMenu(dock);
initializeConsole(dock);
initializeSettings(dock);