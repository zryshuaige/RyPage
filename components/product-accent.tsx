export type ProductId = "ryharness" | "reaground" | "rybox" | "ryagent";

export function ProductAccent({ product }: { product: ProductId }) {
  return <svg className={`product-ambient-art is-${product}`} viewBox="0 0 600 600" aria-hidden="true">
    {product === "ryharness" && <g fill="none" stroke="currentColor"><path d="M74 410C142 294 206 406 274 268S420 214 526 92" /><path d="M95 468C208 430 234 296 347 335S445 223 506 218" opacity=".45" /><circle cx="74" cy="410" r="7" /><circle cx="274" cy="268" r="7" /><circle cx="526" cy="92" r="7" /><circle cx="347" cy="335" r="5" /></g>}
    {product === "reaground" && <g fill="none" stroke="currentColor"><path d="M80 368C48 265 149 150 274 179S442 114 513 213 465 422 349 408 80 368Z" /><path d="M125 347C105 274 178 208 273 224S413 177 456 239 415 363 335 360 179 427 125 347Z" opacity=".7" /><path d="M184 319C180 268 239 254 285 269S370 236 394 276 350 328 303 322 213 364 184 319Z" opacity=".45" /><circle cx="293" cy="293" r="14" /></g>}
    {product === "rybox" && <g fill="none" stroke="currentColor"><rect x="130" y="140" width="330" height="280" rx="22" /><path d="M130 194H460M181 140V194M414 140V194" opacity=".5" /><path d="M219 294L286 249 361 303 293 354Z" /><path d="M293 354V386M219 294V326L293 386 361 337V303" opacity=".55" /><path d="M104 112h36M122 94v36M474 438h36M492 420v36" opacity=".55" /></g>}
    {product === "ryagent" && <g fill="none" stroke="currentColor"><path d="M104 366L231 195 379 252 493 114M231 195L315 421 493 364 379 252M104 366L315 421 493 364" /><circle cx="104" cy="366" r="11" /><circle cx="231" cy="195" r="11" /><circle cx="379" cy="252" r="11" /><circle cx="493" cy="114" r="11" /><circle cx="315" cy="421" r="11" /><circle cx="493" cy="364" r="11" /><circle cx="300" cy="300" r="24" opacity=".5" /></g>}
  </svg>;
}
