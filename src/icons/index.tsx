import dynamic from "next/dynamic";

const Icons = {
	FileIcon: dynamic(() => import("public/svgs/file.svg")),
	GlobeIcon: dynamic(() => import("public/svgs/globe.svg")),
	WindowIcon: dynamic(() => import("public/svgs/window.svg")),
};

export default Icons;
