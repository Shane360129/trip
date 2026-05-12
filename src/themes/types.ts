export interface ThemeDef {
    id: string;
    label: string;
    description: string;
    // CSS custom properties applied to :root
    vars: Record<string, string>;
    // Class names enabling theme-specific decorations
    bodyClass: string;
}
