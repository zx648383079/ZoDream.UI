class DefaultDialogOption implements DialogOption {
    title: string = '提示';
    extra: string = 'loading';      //额外的class
    count: number = 5;
    type?: DialogType = DialogType.tip;
    hasYes: boolean = true;
    hasNo: boolean = true;
    time: number = 0;
    button: string[] = [];
    canMove: boolean = true;
    ondone: Function = function() {
        this.close();
    }
}