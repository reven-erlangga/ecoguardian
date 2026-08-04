fn main() {
    // ponytail: pakai protoc bundled biar gak perlu install protoc manual
    std::env::set_var(
        "PROTOC",
        protoc_bin_vendored::protoc_bin_path()
            .expect("Failed to find bundled protoc")
            .to_str()
            .unwrap(),
    );

    tonic_build::configure()
        .compile_protos(
            &[
                "../../protobuf/classification/service.proto",
                "../../protobuf/twitter/service.proto",
                "../../protobuf/nlp/service.proto",
                "../../protobuf/blockchain/service.proto",
                "../../protobuf/asset/service.proto",
            ],
            &["../../protobuf/"],
        )
        .expect("Failed to compile protos");
}
