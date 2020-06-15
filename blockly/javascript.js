Blockly.JavaScript['facedetect_pico_show_square'] = function(block) {
  var dropdown_display = block.getFieldValue('display');
  
  var code = '_facedetect_pico_.displayBox(' + dropdown_display +');\n';
  return code;
};

Blockly.JavaScript['facedetect_pico_set_opacity'] = function(block) {
  var value_name = Blockly.JavaScript.valueToCode(block, 'OPACITY', Blockly.JavaScript.ORDER_ATOMIC);
  var code = '_facedetect_pico_.setOpacity(' + parseInt(value_name) / 100 + ');\n';
  return code;
};

Blockly.JavaScript['facedetect_pico_get_count'] = function() {
  var code = '_facedetect_pico_.faceCount';
  return [code, Blockly.JavaScript.ORDER_NONE];
};

Blockly.JavaScript['facedetect_pico_get_value'] = function(block) {
  var value_name = Blockly.JavaScript.valueToCode(block, 'INDEX', Blockly.JavaScript.ORDER_ATOMIC);
  var dropdown_name = block.getFieldValue('props');
  var code = '_facedetect_pico_.getValues(' + value_name + ', "' + dropdown_name + '")';
  return [code, Blockly.JavaScript.ORDER_NONE];
};
