const OTHER_WORD_CODE = [8220, 8221, 8216, 8217, 65281, 12290, 65292, 12304, 12305, 12289, 65311, 65288, 65289, 12288, 12298, 12299, 65306];
/**
 * 计算内容的长度，排除空格符号等特殊字符
 */
function wordLength(val: string): number {
    if (!val) {
        return 0;
    }
    let code: number;
    let length = 0;
    for (let i = val.length - 1; i >= 0; i --) {
        code = val.charCodeAt(i);
        if (code < 48
            || (code > 57 && code < 65)
            || (code > 90 && code < 97)
            || (code > 122 && code < 128)
            || (code > 128 && OTHER_WORD_CODE.indexOf(code) >= 0)
            ) {
            continue;
        }
        length ++;
    }
    return length;
}