/**
 * Type declarations for pdf-parse module
 */

declare module 'pdf-parse' {
    interface PDFData {
        /** Total number of pages */
        numpages: number;
        /** Number of pages rendered */
        numrender: number;
        /** PDF info object */
        info: Record<string, any>;
        /** PDF metadata */
        metadata: any;
        /** PDF version */
        version: string;
        /** Extracted text content */
        text: string;
    }

    interface PDFOptions {
        /** Maximum pages to parse (default: 0 = all) */
        max?: number;
        /** Custom page render function */
        pagerender?: (pageData: any) => string;
    }

    function pdfParse(dataBuffer: Buffer, options?: PDFOptions): Promise<PDFData>;

    export = pdfParse;
}
