Blockly.Blocks['facedetect_pico_show_square'] = {
  init: function() {
    this.appendDummyInput()
        .appendField(new Blockly.FieldDropdown([["顯示","true"], ["隱藏","false"]]), "display")
        .appendField("人臉 & 顏色追蹤")
        .appendField("的方塊");
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(210);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['facedetect_pico_set_opacity'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("設定人臉追蹤");
    this.appendValueInput("OPACITY")
        .setCheck(null)
        .appendField("的透明度為");
    this.appendDummyInput()
        .appendField("(0~100)");
    this.setInputsInline(true);
    this.setPreviousStatement(true, null);
    this.setNextStatement(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['facedetect_pico_get_count'] = {
  init: function() {
    this.appendDummyInput()
        .appendField("人臉數量");
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};

Blockly.Blocks['facedetect_pico_get_value'] = {
  init: function() {
    this.appendValueInput("INDEX")
        .setCheck(null)
        .appendField("追蹤第");
    this.appendDummyInput()
        .appendField("個人臉的")
        .appendField(new Blockly.FieldDropdown([["X 座標","x"], ["Y 座標","y"], ["寬度","width"], ["高度","height"]]), "props");
    this.setInputsInline(true);
    this.setOutput(true, null);
    this.setColour(230);
    this.setTooltip("");
    this.setHelpUrl("");
  }
};
