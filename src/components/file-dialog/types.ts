export interface FileType {
	id: number;
	name: string;
	storageType: number;
	description: string;
	fileSize: number;
	author: {
		id: number,
		shortname: string
	};
	contentType: string;
	originalFilename: string;
	fileType: string;
	link: string;
}

export interface FileDescriptionType {
	[p: string]: string | { id: number },
	name: string,
	description: string,
	fileType: string,
	author: { id: number },
}