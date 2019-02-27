import React from "react";
import { shallow } from "enzyme";
import ChecksumAddress from "../ChecksumAddress";

describe("ChecksumAddress", () => {
  it("should render properly non-checksum to checksum", () => {
    const nonCheckSum = "0xfb6916095ca1df60bb79ce92ce3ea74c37c5d359";
    const checkSum = "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359";
    const wrapper = shallow(<ChecksumAddress address={nonCheckSum} />);
    expect(wrapper.find("span").text()).toContain(checkSum);
  });

  it("should render properly checksum to checksum", () => {
    const checkSum = "0xfB6916095ca1df60bB79Ce92cE3Ea74c37c5d359";
    const wrapper = shallow(<ChecksumAddress address={checkSum} />);
    expect(wrapper.find("span").text()).toContain(checkSum);
  });

  it("should add missing 0x prefix", () => {
    const checkSum = "fB6916095ca1df60bB79Ce92cE3Ea74c37c5d359";
    const wrapper = shallow(<ChecksumAddress address={checkSum} />);
    expect(wrapper.find("span").text()).toContain(`0x${checkSum}`);
  });
});
