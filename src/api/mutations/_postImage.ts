import { apiFetch } from "..";

export function _postImage({
	binaryData,
	contentType,
}: {
	binaryData: ArrayBuffer;
	contentType: string;
}) {
	return apiFetch("/image", {
		method: "POST",
		body: binaryData,
		headers: {
			"Content-Type": contentType,
		},
	});
}
