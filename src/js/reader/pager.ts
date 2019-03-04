interface ILine {
    start: number,
    length: number
}

interface IPageLine extends ILine {
    isNew: boolean
}

interface IFont {
    x: number,
    y: number,
    code: string
}

class ReaderPager {
    constructor(
        private text: string
    ) {
        this.lines = ReaderPager.getLines(text);
    }

    public lines: ILine[] = [];

    /**
     * 画第几页的内容（必须先清空内容并绘制背景）
     * @param context 
     * @param page 第几页
     * @param fontSize 字体大小
     * @param lineSpace 行间距
     * @param letterSpace 字间距
     * @param width 可写内容区域宽度
     * @param height 可写内容区域高度
     * @param left 可写内容区域起始左边距
     * @param top 可写内容区域起始顶边距
     * @param color 字体颜色
     * @param fontFamily 字体
     */
    public drawCanvas(context: CanvasRenderingContext2D, page: number, fontSize: number, lineSpace: number, letterSpace: number, width: number, height: number, left: number = 0, top: number = 0, color: string = '#000', fontFamily: string = '微软雅黑'): void {
        ReaderPager.drawCanvasWithFonts(context, this.getOnePage(page, fontSize,lineSpace, letterSpace, width, height, left, top), fontSize +'px ' + fontFamily, color);
    }

    public toHtml(page: number, fontSize: number, lineSpace: number, letterSpace: number, width: number, height: number, left: number = 0, top: number = 0, color: string = '#000', fontFamily: string = '微软雅黑'): void {
        ReaderPager.toHtmlWithFonts(this.getOnePage(page, fontSize,lineSpace, letterSpace, width, height, left, top), fontSize +'px ' + fontFamily, color);
    }

    /**
     * 获取一页数据（包括每一个字及坐标位置）
     * @param page 第几页
     * @param fontSize 字体大小
     * @param lineSpace 行间距
     * @param letterSpace 字间距
     * @param width 可写内容区域宽度
     * @param height 可写内容区域高度
     * @param left 可写内容区域起始左边距
     * @param top 可写内容区域起始顶边距
     */
    public getOnePage(page: number, fontSize: number, lineSpace: number, letterSpace: number, width: number, height: number, left: number = 0, top: number = 0): IFont[] {
        let fontWidth = fontSize + letterSpace,
            fontHeight = fontSize + lineSpace,
            lineLength = Math.floor(width / fontWidth), 
            lineCount = Math.floor(height / fontHeight),
            lines = this.getPageLines(page, lineLength, lineCount),
            fonts = [];
        if (lines.length < 1) {
            return fonts;
        }
        for (let i = 0; i < lines.length; i++) {
            const line = lines[i];
            for (let index = 0; index < line.length; index++) {
                fonts.push({
                    code: this.text.charAt(line.start + index),
                    x: left + (index + (line.isNew ? 2 : 0)) * fontWidth,
                    y: top + i * fontHeight
                });
            }
        }
        return fonts;
    }

    /**
     * 获取总页数
     * @param lineLength 
     * @param lineCount 
     */
    public getPageCount(lineLength : number, lineCount: number): number {
        let count = 0;
        for (let i = 0; i < this.lines.length; i++) {
            count += ReaderPager.toLineCount(this.lines[i], lineLength);
        }
        return Math.ceil(count / lineCount);
    }

    /**
     * 获取一页的段数据
     */
    public getPageLines(page: number, lineLength : number, lineCount: number): IPageLine[] {
        let start = page > 1 ? (page - 1) * lineCount : 0,
            end = start + lineCount,
            lines: IPageLine[] = [],
            index = 0;
        for (let lineIndex = 0; lineIndex < this.lines.length; lineIndex++) {
            const item = this.lines[lineIndex];
            let count = ReaderPager.toLineCount(item, lineLength);
            if (index < end && index + count > start) {
                let i = Math.max(start - index, 0),
                    length = Math.min(count, end - index);
                for (; i < length; i++) {
                    let lineStart = i * lineLength - (i < 1 ? 0 : 2);
                    lines.push({
                        start: item.start + lineStart,
                        length: Math.min(lineLength - (i < 1 ? 2 : 0), item.length - i * lineLength + 2),
                        isNew: i < 1
                    });

                }
            }
            index += count;
            if (index > end) {
                continue;
            }
        }
        return lines;
    }

    /**
     * 提取行数据
     * @param text 
     */
    public static getLines(text: string): ILine[] {
        const lineChar = 10, // \n
            lineChar2 = 14, // \r 
            whiteChar = 32, // 空格
            whiteChar2 = 12288, // 中文空格
            tabChar = 9;
        let lines: ILine[] = [],
            start = -1,
            isWhiteEnd = -1,
            i = 0,
            code: number;
        for (; i < text.length; i ++) {
            code = text.charCodeAt[i];
            if (start < 0 && (
                code === lineChar || code === lineChar2 || code === whiteChar || code === whiteChar2 || code === tabChar
                )) {
                // 判断新一行前几个字符是否为空白或换行字符，是则去掉
                continue;
            }
            if (start < 0) {
                start = i;
                continue;
            }
            
            if (code === lineChar || code === lineChar2) {
                // 根据换行符判断是否进入新的一行，结束则保存
                lines.push({
                    start: start, 
                    length: (isWhiteEnd > 0 ? isWhiteEnd : i) - start 
                });
                isWhiteEnd = start = -1;
                continue;
            }
            if (code === whiteChar || code === whiteChar2 || code === tabChar) {
                // 判断行尾是否有空白字符，有则去掉
                if (isWhiteEnd < 0) {
                    isWhiteEnd = i;
                }
                continue;
            } else {
                isWhiteEnd = -1;
            }
        }
        // 最后做收尾
        if (start > 0) {
            lines.push({
                start: start, 
                length: (isWhiteEnd > 0 ? isWhiteEnd : (i + 1)) - start 
            });
        }
        return lines;
    }

    public static drawCanvasWithFonts(context: CanvasRenderingContext2D, fonts: IFont[], font: string, color: string = '#000') {
        context.font = font;
        // 设置颜色
        context.fillStyle = color;
        // 设置水平对齐方式
        context.textAlign = 'center';
        // 设置垂直对齐方式
        context.textBaseline = 'middle';
        for (let i = 0; i < fonts.length; i++) {
            const font = fonts[i];
            context.fillText(font.code, font.x, font.y);
        }
    }

    public static toHtmlWithFonts(fonts: IFont[], font: string, color: string = '#000'): string {
        let html = '';
        for (let i = 0; i < fonts.length; i++) {
            const font = fonts[i];
            html += '<span style="position: absolute;top: '+font.y+'px;left: '+font.x+'px;font: '+font+';color: '+color+';">'+ font.code +'</span>';
        }
        return '<div style="position: relative;">' + html + '</div>'
    }

    /**
     * 一行可以转化成几段
     * @param line 
     * @param count 
     */
    public static toLineCount(line: ILine, count: number): number {
        return Math.ceil((line.length + 2) / count);
    }
}

