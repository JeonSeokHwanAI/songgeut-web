import { renderToStaticMarkup } from "react-dom/server";
import React from "react";
import 오늘클래스 from "./app/today/page";

const html = renderToStaticMarkup(React.createElement(오늘클래스 as any));
const 글 = html.replace(/<[^>]+>/g, " ").replace(/\s+/g, " ").trim();
console.log(글.slice(0, 200));
