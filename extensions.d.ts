interface Dictionary<T>
{
	[key: string]: T;
}

interface ClassConstructor<T>
{
	new (...args: any[]): T;
}

/* Throw an Error if "test_result" is falsy */
declare function assert(test_result: any, error_message?: string): void;

declare function timeout(delay?: number, signal?: AbortSignal): Promise<void>;

declare namespace TypeCheck
{
	/* Ensure that "value" is neither NULL nor UNDEFINED */
	function isDefined<T>(value: T): value is NonNullable<T>;
	/* Works even if "value" do not inherit from Object */
	function isObject(value: unknown): value is Object;
	/* Same as above, but include functions as well */
	function isObjectLike(value: unknown): value is Object;
	/* An object like with a property length containing an integer */
	function isIterable<T>(value: unknown): value is ArrayLike<T>;
	function getType(value: any): string;
	/* Same as "getType", but for objects it returns the constructor name */
	function getClass(value: any): string;
}

declare namespace SmoothScroller
{
	function moveTo(y: number): void;
	function moveBy(dy: number): void;
	/* offset is the length of the preserved space above the element for fixed positioned elements like headers */
	function moveToElement(element: Element, offset?: number): void;
}

interface ObjectConstructor
{
	/* Until optional chaining support */
	dive<T>(item: Object, chain: string[], default_value?: T): T | undefined;
	combine(keys: string[], values: any[]): Object;
}

interface NumberConstructor
{
	equals: (value1: number, value2: number, epsilon?: number) => boolean;
}

interface Math
{
	randomInt: (min: number, max: number) => number;
}

interface Array<T>
{
	startsBy(needle: Array<T>): boolean;
	unique(): Array<T>;
	diff(other: Array<T>): Array<T>;
	intersect(other: Array<T>): Array<T>;
}

declare namespace Iterator
{
	function toArray<T>(iterable: ArrayLike<T> | Array<T>): Array<T>;
	function from<T>(iterable: ArrayLike<T>, copy?: boolean): Array<T>;
}

interface CollapsedPromise
{
	error: boolean,
	data: any
}

interface Promise<T>
{
	collapse(callback: (arg: CollapsedPromise) => T): Promise<T>;
	afterward(callback: (...args: T[]) => T): Promise<T>;
	finally(callback: () => T): Promise<T>;
}

interface PromiseConstructor
{
	try(callback: () => any): Promise<any>;
}

interface Geolocation
{
	askCurrentPosition: (options?: PositionOptions) => Promise<Position>;
}

interface Location
{
	parameters: () => Dictionary<string>;
}

interface HTMLCollection
{
	removeAll: () => void;
	toFragment: (clone_nodes: boolean) => DocumentFragment;
}

interface NodeList
{
	removeAll: () => void;
	toFragment: (clone_nodes: boolean) => DocumentFragment;
}

interface EventTarget
{
	dispatchCustomEvent: (typeArg: string, detail?: any, composed?: boolean) => void;
}

interface Node
{
	prependChild(child_node: Node): void;
	appendSibling(sibling_node: Node): void;
	prependSibling(sibling_node: Node): void;
	getLineage(): Node[];
}

// @ts-ignore
declare var Node:
{
	getCommonAncestor(node1: Node, node2: Node): Node | null;
}

interface Document
{
	html: HTMLHtmlElement;
}

interface HTMLElement
{
	getComputedStyle: (pseudo_element?: string) => CSSStyleDeclaration;
}

declare type EditableHtmlElement = HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement;

interface HTMLFormElement
{
	getEditableElements: () => Array<EditableHtmlElement>
	getFieldNames: () => Array<string>
	getFields: () => Dictionary<EditableHtmlElement | NodeListOf<EditableHtmlElement>>;
	clear: () => void
}

interface HTMLInputElement
{
	isEmpty: () => boolean;
}

interface HTMLSelectElement
{
	isEmpty: () => boolean;
}

interface HTMLTextAreaElement
{
	isEmpty: () => boolean;
}
