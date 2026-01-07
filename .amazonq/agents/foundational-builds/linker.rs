use std::fs::File;
use std::io::{Read, Write};

struct ObjectFile {
    text: Vec<u8>,
    data: Vec<u8>,
    symbols: Vec<(String, u64)>,
}

fn parse_object(path: &str) -> ObjectFile {
    let mut file = File::open(path).unwrap();
    let mut buf = Vec::new();
    file.read_to_end(&mut buf).unwrap();
    
    ObjectFile {
        text: buf[0..100].to_vec(),
        data: vec![],
        symbols: vec![("main".to_string(), 0x1000)],
    }
}

fn link(objects: Vec<ObjectFile>, output: &str) {
    let mut text_section = Vec::new();
    let mut base_addr = 0x1000u64;
    
    for obj in objects {
        text_section.extend(obj.text);
        base_addr += obj.text.len() as u64;
    }
    
    let mut out = File::create(output).unwrap();
    out.write_all(&text_section).unwrap();
    println!("Linked {} bytes to {}", text_section.len(), output);
}

fn main() {
    let obj1 = parse_object("input1.o");
    let obj2 = parse_object("input2.o");
    link(vec![obj1, obj2], "output.bin");
}
