declare module '*.css' {
  const styles: { [className: string]: string }
  export default styles;
}
declare module '*.svg' {
  const img: string
  export default img;
}
