import dynamic from "next/dynamic";

const Icons = {
	spades: dynamic(() => import("public/svgs/spades.svg")),
	hearts: dynamic(() => import("public/svgs/hearts.svg")),
	clubs: dynamic(() => import("public/svgs/clubs.svg")),
	diamonds: dynamic(() => import("public/svgs/diamonds.svg")),
};

export default Icons;
