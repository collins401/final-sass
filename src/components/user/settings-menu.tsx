import { Link } from "@tanstack/react-router";
import {
	HardDriveIcon,
	KeyIcon,
	Link2Icon,
	type LucideIcon,
	SunMoonIcon,
	UserIcon,
} from "lucide-react";

interface MenuItem {
	title: string;
	url: string;
	icon: LucideIcon;
}

const menuItems: MenuItem[] = [
	{
		title: "Account",
		url: "/settings/account",
		icon: UserIcon,
	},
	{
		title: "Appearance",
		url: "/settings/appearance",
		icon: SunMoonIcon,
	},
	{
		title: "Connections",
		url: "/settings/connections",
		icon: Link2Icon,
	},
	{
		title: "Sessions",
		url: "/settings/sessions",
		icon: HardDriveIcon,
	},
	{
		title: "Password",
		url: "/settings/password",
		icon: KeyIcon,
	},
];

export function Menu() {
	return (
		<div className="pb-12">
			<div className="relative flex gap-6 overflow-x-auto sm:gap-8">
				{menuItems.map((item) => (
					<Link
						activeProps={{
							className:
								"font-medium text-foreground after:absolute after:inset-x-0 after:bottom-0 after:h-0.5 after:bg-foreground after:content-['']",
						}}
						className="relative flex items-center justify-start gap-1.5 py-4 text-muted-foreground"
						key={item.title}
						to={item.url}
					>
						<item.icon className="size-4" />
						<span>{item.title}</span>
					</Link>
				))}
				<div className="-z-10 absolute inset-x-0 bottom-0 h-0.5 bg-muted" />
			</div>
		</div>
	);
}
