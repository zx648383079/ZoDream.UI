declare class search {
    /**
     * replace
     */
    static replace(key: string, val: string): void;
    /**
     * sort
     */
    static sort(name: string, order?: string): void;
    /**
     * replaceInput
     */
    static replaceInput(...names: string[]): void;
    /**
     * prevPage
     */
    static prevPage(): void;
    /**
     * page
     */
    static page(page: number): void;
    /**
     * nextPage
     */
    static nextPage(): void;
}
