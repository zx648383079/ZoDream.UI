class DefaultDialogOption implements DialogOption {
    title: string = '提示';
    type?: DialogType = DialogType.tip;
    canMove: boolean = true;
    ondone: Function = function() {
        this.close();
    }
}