/**
 * Dodaje do elementu textarea funkcję automatycznego zwiększania
 * wysokości, gdy jest potrzeba
 * @param element Element <textarea>
 */
export function AutoGrow(element: HTMLTextAreaElement) {
    element.addEventListener('input', () => {
        element.style.height = "5px";
        element.style.height = (element.scrollHeight + 2) + "px";
    });
}