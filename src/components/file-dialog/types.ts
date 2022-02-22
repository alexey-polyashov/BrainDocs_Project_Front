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