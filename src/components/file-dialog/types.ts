import { NamedSelectionType } from "../../types";

export interface FileDescriptionType {
	name: string,
	description: string,
	fileType: string,
	author: NamedSelectionType,
	id?: number,
	fileRaw?: File
}

export interface FullFileType extends FileDescriptionType {
	storageType: number;
	fileSize: number;
	contentType: string;
	originalFilename: string;
	link: string;
}
