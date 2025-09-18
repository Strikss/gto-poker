import type { NextConfig } from "next";

import { PHASE_DEVELOPMENT_SERVER } from "next/constants";

const svgLoaderConfig = {
	loader: "@svgr/webpack",
	options: {
		dimensions: false,
		icon: true,
		svgProps: {
			width: "1em",
			height: "1em",
			fill: "currentColor",
		},
	},
};

const buildHeaders = (phase: string) => {
	// https://securityheaders.com
	const ContentSecurityPolicy = `
    base-uri 'self';
    connect-src 'self' https:;
    default-src 'self';
    font-src 'self' fonts.gstatic.com https:;
    form-action 'self';
    frame-ancestors 'none';
    img-src 'self' data: https:;
    object-src 'none';
    script-src 'self' 'unsafe-inline' ${phase === PHASE_DEVELOPMENT_SERVER ? "'unsafe-eval'" : ""};
    style-src 'self' 'unsafe-inline' https:;
  `;

	return [
		// https://developer.mozilla.org/en-US/docs/Web/HTTP/CSP
		{ key: "Content-Security-Policy", value: ContentSecurityPolicy.replace(/\n/g, "") },
		// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Referrer-Policy
		{ key: "Referrer-Policy", value: "no-referrer-when-downgrade" },
		// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/Strict-Transport-Security
		{ key: "Strict-Transport-Security", value: "max-age=31536000; includeSubDomains; preload" },
		// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Frame-Options
		{ key: "X-Frame-Options", value: "DENY" },
		// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-Content-Type-Options
		{ key: "X-Content-Type-Options", value: "nosniff" },
		// https://developer.mozilla.org/en-US/docs/Web/HTTP/Headers/X-DNS-Prefetch-Control
		{ key: "X-DNS-Prefetch-Control", value: "on" },
	];
};

const nextConfig = (phase: string): NextConfig => ({
	images: {
		remotePatterns: [
			{ protocol: "http", hostname: "*" },
			{ protocol: "https", hostname: "*" },
		],
	},
	poweredByHeader: false,
	reactStrictMode: true,
	turbopack: {
		rules: {
			"*.svg": {
				as: "*.js",
				loaders: [svgLoaderConfig],
			},
		},
	},
	webpack(config) {
		config.module.rules.push({
			test: /\.svg$/,
			use: [svgLoaderConfig],
		});
		return config;
	},

	headers: async () => {
		return await [{ source: "/(.*)", headers: buildHeaders(phase) }];
	},
});

export default nextConfig;
