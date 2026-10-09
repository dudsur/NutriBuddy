#!/usr/bin/env python3
"""
Minimal RV32I subset simulator for EECS 2021 Lab B demos.
Supports: addi, add, sub, slli, srli, srai, andi, or, lw, sw, la (pseudo).
Prints a TA-style step walkthrough of registers and memory.
"""

from __future__ import annotations

import argparse
import re
import struct
from dataclasses import dataclass, field
from pathlib import Path
from typing import Dict, List, Optional, Tuple


REG_ALIASES = {
    "x0": 0, "zero": 0,
    "x1": 1, "ra": 1,
    "x2": 2, "sp": 2,
    "x3": 3, "gp": 3,
    "x4": 4, "tp": 4,
    "x5": 5, "t0": 5,
    "x6": 6, "t1": 6,
    "x7": 7, "t2": 7,
    "x8": 8, "s0": 8, "fp": 8,
    "x9": 9, "s1": 9,
    "x10": 10, "a0": 10,
    "x11": 11, "a1": 11,
    "x12": 12, "a2": 12,
    "x13": 13, "a3": 13,
    "x14": 14, "a4": 14,
    "x15": 15, "a5": 15,
    "x16": 16, "a6": 16,
    "x17": 17, "a7": 17,
    "x18": 18, "s2": 18,
    "x19": 19, "s3": 19,
    "x20": 20, "s4": 20,
    "x21": 21, "s5": 21,
    "x22": 22, "s6": 22,
    "x23": 23, "s7": 23,
    "x24": 24, "s8": 24,
    "x25": 25, "s9": 25,
    "x26": 26, "s10": 26,
    "x27": 27, "s11": 27,
    "x28": 28, "t3": 28,
    "x29": 29, "t4": 29,
    "x30": 30, "t5": 30,
    "x31": 31, "t6": 31,
}


def to_u32(v: int) -> int:
    return v & 0xFFFFFFFF


def to_i32(v: int) -> int:
    v = v & 0xFFFFFFFF
    return v - 0x100000000 if v >= 0x80000000 else v


def parse_imm(tok: str) -> int:
    tok = tok.strip().lower().rstrip(",")
    if tok.startswith("0x"):
        return int(tok, 16)
    return int(tok, 10)


def parse_reg(tok: str) -> int:
    tok = tok.strip().lower().rstrip(",")
    if tok not in REG_ALIASES:
        raise ValueError(f"Unknown register: {tok}")
    return REG_ALIASES[tok]


@dataclass
class CPU:
    regs: List[int] = field(default_factory=lambda: [0] * 32)
    mem: bytearray = field(default_factory=lambda: bytearray(4096))
    pc: int = 0
    labels: Dict[str, int] = field(default_factory=dict)
    mem_base: int = 0x1000
    watch_regs: List[int] = field(default_factory=list)
    watch_mem: List[Tuple[int, int]] = field(default_factory=list)  # (addr, words)

    def set_reg(self, rd: int, val: int) -> None:
        if rd != 0:
            self.regs[rd] = to_u32(val)

    def get_reg(self, rs: int) -> int:
        return self.regs[rs]

    def load_word(self, addr: int) -> int:
        off = addr - self.mem_base
        return struct.unpack_from("<i", self.mem, off)[0]

    def store_word(self, addr: int, val: int) -> None:
        off = addr - self.mem_base
        struct.pack_into("<i", self.mem, off, to_i32(val))

    def dump_watched(self) -> str:
        lines = []
        for r in self.watch_regs:
            v = to_i32(self.regs[r])
            lines.append(f"  x{r:02d} = {v:11d}  (0x{to_u32(v):08X})")
        for addr, nwords in self.watch_mem:
            for i in range(nwords):
                a = addr + 4 * i
                v = self.load_word(a)
                lines.append(f"  mem[0x{a:04X}] = {v:11d}  (0x{to_u32(v):08X})")
        return "\n".join(lines)


def strip_comment(line: str) -> str:
    if "#" in line:
        line = line[: line.index("#")]
    return line.strip()


def parse_program(src: str) -> Tuple[List[str], Dict[str, List[int]], Dict[str, int]]:
    """Return (text_instrs, data_words_by_label, label_to_addr_placeholder)."""
    lines = src.splitlines()
    section = "text"
    text: List[str] = []
    data_labels: Dict[str, List[int]] = {}
    current_data_label: Optional[str] = None
    text_labels: Dict[str, int] = {}

    for raw in lines:
        line = strip_comment(raw)
        if not line:
            continue
        if line.startswith(".data"):
            section = "data"
            continue
        if line.startswith(".text"):
            section = "text"
            continue

        # label:
        m = re.match(r"^([A-Za-z_][\w]*):\s*(.*)$", line)
        label = None
        rest = line
        if m:
            label = m.group(1)
            rest = m.group(2).strip()

        if section == "data":
            if label:
                current_data_label = label
                data_labels[label] = []
            if not rest:
                continue
            if rest.startswith(".word"):
                payload = rest[len(".word") :].strip()
                vals = [parse_imm(p) for p in payload.split(",") if p.strip()]
                if current_data_label is None:
                    current_data_label = f"_anon_{len(data_labels)}"
                    data_labels[current_data_label] = []
                data_labels[current_data_label].extend(vals)
            continue

        # text
        if label:
            text_labels[label] = len(text)
        if rest:
            text.append(rest)

    return text, data_labels, text_labels


def layout_data(cpu: CPU, data_labels: Dict[str, List[int]]) -> None:
    addr = cpu.mem_base
    for name, words in data_labels.items():
        cpu.labels[name] = addr
        for w in words:
            cpu.store_word(addr, w)
            addr += 4


def parse_mem_operand(tok: str) -> Tuple[int, int]:
    """Parse imm(rs) → (imm, rs)."""
    tok = tok.strip().rstrip(",")
    m = re.match(r"^(-?(?:0x[0-9a-fA-F]+|\d+))\(([^)]+)\)$", tok)
    if not m:
        raise ValueError(f"Bad memory operand: {tok}")
    return parse_imm(m.group(1)), parse_reg(m.group(2))


def exec_one(cpu: CPU, instr: str) -> str:
    parts = [p for p in re.split(r"[,\s]+", instr) if p]
    op = parts[0].lower()

    if op == "addi":
        rd, rs1, imm = parse_reg(parts[1]), parse_reg(parts[2]), parse_imm(parts[3])
        before = to_i32(cpu.get_reg(rs1))
        cpu.set_reg(rd, before + imm)
        return f"addi  x{rd}, x{rs1}, {imm}     → x{rd} = {before} + {imm} = {to_i32(cpu.get_reg(rd))}"

    if op == "add":
        rd, rs1, rs2 = parse_reg(parts[1]), parse_reg(parts[2]), parse_reg(parts[3])
        a, b = to_i32(cpu.get_reg(rs1)), to_i32(cpu.get_reg(rs2))
        cpu.set_reg(rd, a + b)
        return f"add   x{rd}, x{rs1}, x{rs2}    → x{rd} = {a} + {b} = {to_i32(cpu.get_reg(rd))}"

    if op == "sub":
        rd, rs1, rs2 = parse_reg(parts[1]), parse_reg(parts[2]), parse_reg(parts[3])
        a, b = to_i32(cpu.get_reg(rs1)), to_i32(cpu.get_reg(rs2))
        cpu.set_reg(rd, a - b)
        return f"sub   x{rd}, x{rs1}, x{rs2}    → x{rd} = {a} - {b} = {to_i32(cpu.get_reg(rd))}"

    if op == "slli":
        rd, rs1, sh = parse_reg(parts[1]), parse_reg(parts[2]), parse_imm(parts[3])
        a = to_u32(cpu.get_reg(rs1))
        cpu.set_reg(rd, a << sh)
        return f"slli  x{rd}, x{rs1}, {sh}     → x{rd} = 0x{a:08X} << {sh} = 0x{to_u32(cpu.get_reg(rd)):08X}"

    if op == "srli":
        rd, rs1, sh = parse_reg(parts[1]), parse_reg(parts[2]), parse_imm(parts[3])
        a = to_u32(cpu.get_reg(rs1))
        cpu.set_reg(rd, a >> sh)
        return f"srli  x{rd}, x{rs1}, {sh}     → x{rd} = 0x{a:08X} >> {sh} = 0x{to_u32(cpu.get_reg(rd)):08X}"

    if op == "srai":
        rd, rs1, sh = parse_reg(parts[1]), parse_reg(parts[2]), parse_imm(parts[3])
        a = to_i32(cpu.get_reg(rs1))
        cpu.set_reg(rd, a >> sh)  # Python >> on signed int is arithmetic
        return f"srai  x{rd}, x{rs1}, {sh}     → x{rd} = {a} >> {sh} = {to_i32(cpu.get_reg(rd))}"

    if op == "andi":
        rd, rs1, imm = parse_reg(parts[1]), parse_reg(parts[2]), parse_imm(parts[3])
        a = to_u32(cpu.get_reg(rs1))
        cpu.set_reg(rd, a & to_u32(imm))
        return f"andi  x{rd}, x{rs1}, {imm}    → x{rd} = 0x{to_u32(cpu.get_reg(rd)):08X}"

    if op == "or":
        rd, rs1, rs2 = parse_reg(parts[1]), parse_reg(parts[2]), parse_reg(parts[3])
        a, b = to_u32(cpu.get_reg(rs1)), to_u32(cpu.get_reg(rs2))
        cpu.set_reg(rd, a | b)
        return f"or    x{rd}, x{rs1}, x{rs2}    → x{rd} = 0x{to_u32(cpu.get_reg(rd)):08X}"

    if op == "la":
        rd = parse_reg(parts[1])
        label = parts[2].rstrip(",")
        if label not in cpu.labels:
            raise ValueError(f"Unknown label: {label}")
        cpu.set_reg(rd, cpu.labels[label])
        return f"la    x{rd}, {label}         → x{rd} = 0x{cpu.labels[label]:04X}"

    if op == "lw":
        rd = parse_reg(parts[1])
        imm, rs1 = parse_mem_operand(parts[2])
        addr = to_u32(cpu.get_reg(rs1)) + imm
        val = cpu.load_word(addr)
        cpu.set_reg(rd, val)
        return f"lw    x{rd}, {imm}(x{rs1})    → x{rd} = mem[0x{addr:04X}] = {val}"

    if op == "sw":
        rs2 = parse_reg(parts[1])
        imm, rs1 = parse_mem_operand(parts[2])
        addr = to_u32(cpu.get_reg(rs1)) + imm
        val = to_i32(cpu.get_reg(rs2))
        cpu.store_word(addr, val)
        return f"sw    x{rs2}, {imm}(x{rs1})   → mem[0x{addr:04X}] = {val}"

    raise ValueError(f"Unsupported instruction: {instr}")


def run_demo(path: Path, title: str, watch_regs: List[int], watch_mem_words: int = 0) -> str:
    src = path.read_text()
    text, data_labels, _ = parse_program(src)
    cpu = CPU(watch_regs=watch_regs)

    out: List[str] = []
    out.append("=" * 72)
    out.append(title)
    out.append("=" * 72)

    if data_labels:
        layout_data(cpu, data_labels)
        # watch from first data label
        first = next(iter(data_labels))
        nwords = sum(len(v) for v in data_labels.values())
        cpu.watch_mem = [(cpu.labels[first], nwords if watch_mem_words == 0 else watch_mem_words)]
        out.append("\nInitial memory (.data):")
        out.append(cpu.dump_watched())

    out.append("\nExecution trace:\n")
    for i, instr in enumerate(text, 1):
        note = exec_one(cpu, instr)
        out.append(f"[{i:02d}] {note}")
        dump = cpu.dump_watched()
        if dump:
            out.append(dump)
        out.append("")

    out.append("-" * 72)
    out.append("FINAL CHECKPOINT")
    out.append(cpu.dump_watched())
    out.append("-" * 72)
    return "\n".join(out)


def main() -> None:
    parser = argparse.ArgumentParser()
    parser.add_argument("problem", choices=["1", "2", "3", "all"])
    args = parser.parse_args()

    root = Path(__file__).resolve().parent.parent / "solutions"
    demos = {
        "1": (
            root / "problem1.s",
            "Problem 1 — X = (A-B)*4 + (C>>2)   [expect x5 = 3056]",
            list(range(5, 15)),
            0,
        ),
        "2": (
            root / "problem2.s",
            "Problem 2 — build 0xABCD0000 in x5",
            [5, 6, 7],
            0,
        ),
        "3": (
            root / "problem3.s",
            "Problem 3 — /4 in place + sum   [expect sum = 22]",
            [5, 10, 11, 12, 13, 14, 15, 16, 17, 18],
            9,
        ),
    }

    keys = ["1", "2", "3"] if args.problem == "all" else [args.problem]
    for k in keys:
        path, title, regs, memw = demos[k]
        print(run_demo(path, title, regs, memw))
        print()


if __name__ == "__main__":
    main()
